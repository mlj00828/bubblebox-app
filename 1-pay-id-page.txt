"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Header, Footer } from "@/components/Chrome";
import {
  fetchBooking,
  toE164USPhone,
  formatPhoneForDisplay,
  type BookingResponse,
} from "@/lib/api";
import { formatPrice } from "@/lib/services";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

const stripePromise: Promise<StripeJs | null> | null =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

// Payment states that mean no further payment action is needed.
const SETTLED = new Set(["authorized", "paid"]);

type Phase = "verify" | "loading" | "ready" | "settled" | "error";

export default function PayPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const loadWithPhone = useCallback(
    async (phone: string) => {
      setPhase("loading");
      setError(null);
      try {
        const b = await fetchBooking(id, phone);
        if (!b) {
          setError(
            "We couldn't find a booking matching that phone number. Double-check the number you booked with."
          );
          setPhase("verify");
          setVerifying(false);
          return;
        }
        try {
          sessionStorage.setItem(`booking-phone-${id}`, phone);
        } catch {
          // storage unavailable — fine
        }
        setBooking(b);
        setPhase(SETTLED.has(b.payment_status) ? "settled" : "ready");
      } catch {
        setError("Couldn't reach the server. Please try again in a moment.");
        setPhase("verify");
      } finally {
        setVerifying(false);
      }
    },
    [id]
  );

  // On mount, try a stored phone (set during booking on this device). If we
  // don't have one — e.g. the customer tapped a link from their phone's texts
  // on a different device — fall back to asking them to confirm their number.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(`booking-phone-${id}`);
    } catch {
      // ignore
    }
    if (stored) {
      loadWithPhone(stored);
    } else {
      setPhase("verify");
    }
  }, [id, loadWithPhone]);

  function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    const e164 = toE164USPhone(phoneInput);
    if (!e164) {
      setError("Enter a valid 10-digit US phone number.");
      return;
    }
    setVerifying(true);
    loadWithPhone(e164);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-12 md:px-8 md:py-16">
        {phase === "verify" && (
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">Pay for your cleaning</h1>
            <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
              Confirm the phone number you booked with and we&apos;ll pull up your
              booking.
            </p>
            <form onSubmit={submitPhone} className="mt-8">
              <label
                className="mb-2 block text-sm font-semibold"
                htmlFor="phone"
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="(404) 555-0199"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  border: "1.5px solid var(--color-surface-mid)",
                  borderRadius: 12,
                  fontSize: 16,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              {error && (
                <div style={{ marginTop: 10, fontSize: 14, color: "var(--color-danger)" }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={verifying}
                style={{
                  marginTop: 16,
                  width: "100%",
                  background:
                    "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 50,
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: verifying ? "wait" : "pointer",
                  opacity: verifying ? 0.6 : 1,
                  fontFamily: "inherit",
                }}
              >
                {verifying ? "Looking up…" : "Find my booking"}
              </button>
            </form>
          </div>
        )}

        {phase === "loading" && (
          <div className="py-20 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            Loading your booking…
          </div>
        )}

        {phase === "error" && (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              ← Back home
            </Link>
          </div>
        )}

        {phase === "settled" && booking && (
          <div className="text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ background: "var(--color-success)" }}
            >
              ✓
            </div>
            <h1 className="text-3xl font-extrabold md:text-4xl">You&apos;re all set</h1>
            <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
              {booking.payment_status === "paid"
                ? "This booking is paid in full. Nothing else to do."
                : "Your card is on file and a hold is in place. You'll be charged only after your cleaning is complete."}
            </p>
            <BookingSummary booking={booking} />
          </div>
        )}

        {phase === "ready" && booking && (
          <PayForBooking booking={booking} onPaid={() => setPhase("settled")} />
        )}
      </main>
      <Footer />
    </>
  );
}

function BookingSummary({ booking }: { booking: BookingResponse }) {
  const amount = booking.final_total_cents ?? booking.estimated_total_cents ?? 0;
  const dateStr = booking.preferred_date
    ? new Date(booking.preferred_date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "—";
  return (
    <div
      style={{
        marginTop: 28,
        textAlign: "left",
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-surface-mid)",
        borderRadius: 16,
        padding: "18px 20px",
      }}
    >
      <Row label="Service">
        {booking.service_icon} {booking.service_name}
      </Row>
      <Row label="Date">
        {dateStr} · {booking.preferred_window}
      </Row>
      <Row label="Address">{booking.address_line}</Row>
      <Row label="Booked under">
        {formatPhoneForDisplay(booking.customer_phone)}
      </Row>
      <div
        style={{
          borderTop: "1px solid var(--color-surface-mid)",
          marginTop: 12,
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
        <span
          style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)" }}
        >
          {formatPrice(amount)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        fontSize: 14,
        padding: "4px 0",
      }}
    >
      <span style={{ color: "var(--color-muted)" }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{children}</span>
    </div>
  );
}

function PayForBooking({
  booking,
  onPaid,
}: {
  booking: BookingResponse;
  onPaid: () => void;
}) {
  const amount = booking.final_total_cents ?? booking.estimated_total_cents ?? 0;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [secretError, setSecretError] = useState<string | null>(null);

  useEffect(() => {
    if (amount <= 0) {
      setSecretError("This booking has no amount due.");
      setLoadingSecret(false);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/payments/create-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: booking.id,
        amount_cents: amount,
        customer_email: booking.customer_email || undefined,
        customer_name: booking.customer_name || undefined,
      }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j?.data?.client_secret) setClientSecret(j.data.client_secret);
        else setSecretError("Couldn't start payment. Please refresh and try again.");
      })
      .catch(() => {
        if (!cancelled) setSecretError("Couldn't reach the payment server.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSecret(false);
      });
    return () => {
      cancelled = true;
    };
  }, [booking.id, booking.customer_email, booking.customer_name, amount]);

  return (
    <div>
      <h1 className="text-3xl font-extrabold md:text-4xl">Complete your payment</h1>
      <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
        A hold is placed on your card now. You&apos;re charged only after your
        cleaning is complete.
      </p>

      <BookingSummary booking={booking} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          color: "#15803d",
          fontWeight: 600,
          margin: "16px 0",
        }}
      >
        🔒 Secure checkout — Stripe-encrypted. Pre-authorization hold only.
      </div>

      {loadingSecret && (
        <div style={{ textAlign: "center", padding: 24, color: "var(--color-muted)" }}>
          Loading payment form…
        </div>
      )}
      {secretError && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            fontSize: 14,
            color: "var(--color-danger)",
          }}
        >
          {secretError}
        </div>
      )}
      {!stripePromise && !loadingSecret && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            fontSize: 14,
            color: "var(--color-danger)",
          }}
        >
          Payments aren&apos;t configured on this site. Set
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in the environment.
        </div>
      )}

      {clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: { theme: "stripe" } }}
        >
          <PayInner clientSecret={clientSecret} bookingId={booking.id} onPaid={onPaid} />
        </Elements>
      )}

      <div
        style={{
          fontSize: 11,
          color: "var(--color-muted)",
          textAlign: "center",
          padding: "14px 0 0",
        }}
      >
        By paying you agree to our{" "}
        <Link href="/terms" style={{ color: "var(--color-accent)" }}>
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" style={{ color: "var(--color-accent)" }}>
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}

function PayInner({
  clientSecret,
  bookingId,
  onPaid,
}: {
  clientSecret: string;
  bookingId: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function confirm() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErr(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErr(submitError.message || "Please check your card details.");
      setSubmitting(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (result.error) {
      setErr(result.error.message || "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // Bind this payment intent to the booking server-side so admin/dispatch
    // see it as authorized.
    const pi = clientSecret.split("_secret_")[0];
    try {
      await fetch(`${API_BASE}/api/payments/attach-to-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, payment_intent_id: pi }),
      });
    } catch {
      // The webhook is the source of truth; attach is best-effort.
    }

    setSubmitting(false);
    onPaid();
  }

  return (
    <div
      style={{
        background: "white",
        border: "1.5px solid var(--color-rule)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <PaymentElement />
      {err && (
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--color-danger)" }}>
          {err}
        </div>
      )}
      <button
        onClick={confirm}
        disabled={!stripe || submitting}
        style={{
          marginTop: 14,
          width: "100%",
          background:
            "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
          color: "white",
          border: "none",
          borderRadius: 50,
          padding: 14,
          fontSize: 15,
          fontWeight: 700,
          cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.6 : 1,
          fontFamily: "inherit",
        }}
      >
        {submitting ? "Processing…" : "Confirm payment"}
      </button>
    </div>
  );
}
