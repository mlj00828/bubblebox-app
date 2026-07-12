// payments-admin-routes.js — BubbleBox backend drop-in
//
// Adds the two admin payment actions the admin panel (/admin/payments) calls:
//   POST /api/admin/bookings/:id/capture   — charge an authorized pre-auth hold
//   POST /api/admin/bookings/:id/refund    — refund a captured payment
//
// Also exports sendPayNowSms() so the booking-creation flow can text customers
// a link to the standalone payment page when their card isn't on file yet.
//
// NOTE: your backend already has an admin-gated POST /api/payments/capture.
// This module is self-contained and doesn't touch it. Once these routes are
// live you can retire the old one, or keep both — the admin UI only calls
// the /api/admin/bookings/:id/* routes below.
//
// Wiring (same pattern as dispatch-routes.js):
//
//   const registerPayments = require("./payments-admin-routes");
//   const { sendPayNowSms } = registerPayments({
//     router: app,          // your Express app or router
//     pool,                 // pg Pool
//     stripe,               // require("stripe")(process.env.STRIPE_SECRET_KEY)
//     requireAdmin,         // your existing x-admin-token middleware
//     sendSms,              // your existing Twilio helper: (toE164, body) => Promise
//   });
//
// Then, in your POST /api/bookings handler, after the booking row is created:
//
//   if (booking.payment_status === "pending") {
//     sendPayNowSms(booking).catch(console.error); // fire-and-forget
//   }

const SITE_BASE = process.env.PUBLIC_SITE_URL || "https://www.bubbleboxatl.com";

// Stripe only accepts these refund reasons; anything else goes in metadata.
const STRIPE_REFUND_REASONS = new Set([
  "duplicate",
  "fraudulent",
  "requested_by_customer",
]);

module.exports = function registerPayments({
  router,
  pool,
  stripe,
  requireAdmin,
  sendSms,
}) {
  // ── Shared: load booking or 404 ─────────────────────────────────
  async function loadBooking(id) {
    const { rows } = await pool.query(
      `SELECT b.*, c.name AS customer_name, c.phone AS customer_phone
         FROM bookings b
         LEFT JOIN customers c ON c.id = b.customer_id
        WHERE b.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  function err(res, status, code, message) {
    return res.status(status).json({ error: { code, message } });
  }

  // ── POST /api/admin/bookings/:id/capture ────────────────────────
  // Body: { amount_cents? }  — omit to capture the full authorized amount.
  router.post(
    "/api/admin/bookings/:id/capture",
    requireAdmin,
    async (req, res) => {
      try {
        const booking = await loadBooking(req.params.id);
        if (!booking) return err(res, 404, "not_found", "Booking not found.");
        if (!booking.stripe_payment_intent_id)
          return err(res, 409, "no_payment_intent",
            "No Stripe payment is attached to this booking.");
        if (booking.payment_status !== "authorized")
          return err(res, 409, "not_capturable",
            `Payment is '${booking.payment_status}' — only authorized holds can be captured.`);

        const amount = req.body?.amount_cents;
        if (amount != null && (!Number.isInteger(amount) || amount <= 0))
          return err(res, 400, "validation_error",
            "amount_cents must be a positive integer.");

        const pi = await stripe.paymentIntents.capture(
          booking.stripe_payment_intent_id,
          amount != null ? { amount_to_capture: amount } : {}
        );

        const captured = pi.amount_received ?? amount ?? booking.final_total_cents;
        await pool.query(
          `UPDATE bookings
              SET payment_status = 'paid',
                  final_total_cents = $2,
                  updated_at = NOW()
            WHERE id = $1`,
          [booking.id, captured]
        );

        res.json({
          data: {
            booking_id: booking.id,
            payment_status: "paid",
            amount_cents: captured,
            stripe_payment_intent_id: booking.stripe_payment_intent_id,
            message: `Captured $${(captured / 100).toFixed(2)}.`,
          },
        });
      } catch (e) {
        // Surface Stripe's own message — it's usually actionable
        // (e.g. "PaymentIntent could not be captured because it has expired").
        console.error("[capture]", e);
        if (e.type && e.type.startsWith("Stripe"))
          return err(res, 502, "stripe_error", e.message);
        return err(res, 500, "server_error", "Capture failed.");
      }
    }
  );

  // ── POST /api/admin/bookings/:id/refund ─────────────────────────
  // Body: { amount_cents?, reason? } — omit amount_cents for a full refund.
  router.post(
    "/api/admin/bookings/:id/refund",
    requireAdmin,
    async (req, res) => {
      try {
        const booking = await loadBooking(req.params.id);
        if (!booking) return err(res, 404, "not_found", "Booking not found.");
        if (!booking.stripe_payment_intent_id)
          return err(res, 409, "no_payment_intent",
            "No Stripe payment is attached to this booking.");
        if (booking.payment_status !== "paid")
          return err(res, 409, "not_refundable",
            `Payment is '${booking.payment_status}' — only paid bookings can be refunded.`);

        const amount = req.body?.amount_cents;
        if (amount != null && (!Number.isInteger(amount) || amount <= 0))
          return err(res, 400, "validation_error",
            "amount_cents must be a positive integer.");

        const reasonRaw = (req.body?.reason || "").trim();
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          ...(amount != null ? { amount } : {}),
          // Stripe rejects free-text reasons; pass the enum if it matches,
          // keep the operator's actual note in metadata either way.
          ...(STRIPE_REFUND_REASONS.has(reasonRaw) ? { reason: reasonRaw } : {}),
          metadata: {
            booking_id: booking.id,
            ...(reasonRaw ? { operator_note: reasonRaw.slice(0, 400) } : {}),
          },
        });

        const total = booking.final_total_cents ?? booking.estimated_total_cents ?? 0;
        const isFull = amount == null || amount >= total;
        // Partial refunds leave the booking 'paid' (money was still collected);
        // only a full refund flips the status.
        if (isFull) {
          await pool.query(
            `UPDATE bookings SET payment_status = 'refunded', updated_at = NOW()
              WHERE id = $1`,
            [booking.id]
          );
        }

        res.json({
          data: {
            booking_id: booking.id,
            payment_status: isFull ? "refunded" : "paid",
            amount_cents: refund.amount,
            stripe_payment_intent_id: booking.stripe_payment_intent_id,
            message: isFull
              ? `Refunded $${(refund.amount / 100).toFixed(2)} in full.`
              : `Partially refunded $${(refund.amount / 100).toFixed(2)}.`,
          },
        });
      } catch (e) {
        console.error("[refund]", e);
        if (e.type && e.type.startsWith("Stripe"))
          return err(res, 502, "stripe_error", e.message);
        return err(res, 500, "server_error", "Refund failed.");
      }
    }
  );

  // ── Pay-now SMS ──────────────────────────────────────────────────
  // Call after creating a booking whose payment_status is still 'pending'
  // (card wasn't confirmed during booking, or the charge failed). Safe to
  // call fire-and-forget; failures are logged, never thrown to the caller.
  async function sendPayNowSms(booking) {
    try {
      const phone = booking.customer_phone;
      if (!phone) return;
      const to = phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "").slice(-10)}`;
      const link = `${SITE_BASE}/pay/${booking.id}`;
      const svc = booking.service_name || "cleaning";
      await sendSms(
        to,
        `BubbleBox: your ${svc} on ${booking.preferred_date} is reserved! ` +
          `Secure your spot by adding a card (you're only charged after the job is done): ${link}`
      );
    } catch (e) {
      console.error("[sendPayNowSms]", e);
    }
  }

  return { sendPayNowSms };
};
