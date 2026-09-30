"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { fetchBooking, toE164USPhone, type BookingResponse } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

type Phase = "verify" | "loading" | "ready" | "tip" | "done" | "error";

// Set in .env as NEXT_PUBLIC_GOOGLE_REVIEW_URL; falls back to the live link so
// the button never renders dead.
const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? "https://g.page/r/Cd2u7-MQdphVEAE/review";

const TIP_OPTIONS = [500, 1000, 1500, 2000];

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [phone, setPhoneState] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cleaner, setCleaner] = useState<{ pro_id?: string; first_name: string } | null>(null);

  // On the thank-you screen, learn who cleaned so we can offer a one-tap rebook
  useEffect(() => {
    if (phase !== "done" || !phone) return;
    fetch(`${API_BASE}/api/bookings/${id}/track?phone=${encodeURIComponent(phone)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const first = j?.data?.pro?.first_name;
        if (first) setCleaner({ first_name: first });
      })
      .catch(() => {});
  }, [phase, phone, id]);

  const loadWithPhone = useCallback(
    async (p: string) => {
      setPhase("loading");
      setError(null);
      try {
        const b = await fetchBooking(id, p);
        if (!b) {
          setError("We couldn't find a booking for that phone number.");
          setPhase("verify");
          return;
        }
        try {
          sessionStorage.setItem(`booking-phone-${id}`, p);
        } catch {
          // fine
        }
        setPhoneState(p);
        setBooking(b);
        setPhase("ready");
      } catch {
        setError("Couldn't reach the server — try again in a moment.");
        setPhase("verify");
      }
    },
    [id]
  );

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(`booking-phone-${id}`);
    } catch {
      // fine
    }
    if (stored) loadWithPhone(stored);
    else setPhase("verify");
  }, [id, loadWithPhone]);

  function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    const e164 = toE164USPhone(phoneInput);
    if (!e164) {
      setError("Enter a valid 10-digit US phone number.");
      return;
    }
    loadWithPhone(e164);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-12 md:px-8 md:py-16">
        {phase === "verify" && (
          <div>
            <h1 className="text-3xl font-extrabold md:text-4xl">Rate your clean</h1>
            <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
              Confirm the phone number you booked with and we&apos;ll pull up your visit.
            </p>
            <form onSubmit={submitPhone} className="mt-8">
              <label className="mb-2 block text-sm font-semibold" htmlFor="phone">
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
                <div style={{ marginTop: 10, fontSize: 14, color: "var(--color-danger)" }}>{error}</div>
              )}
              <button
                type="submit"
                style={{
                  marginTop: 16,
                  width: "100%",
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 50,
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Find my booking
              </button>
            </form>
          </div>
        )}

        {phase === "loading" && (
          <div className="py-20 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            Loading your booking…
          </div>
        )}

        {phase === "ready" && booking && phone && (
          <ReviewForm booking={booking} phone={phone} onDone={() => setPhase("tip")} />
        )}

        {phase === "tip" && booking && phone && (
          <TipStep
            bookingId={booking.id}
            phone={phone}
            cleanerName={cleaner?.first_name}
            onDone={() => setPhase("done")}
          />
        )}

        {phase === "done" && (
          <div className="py-10 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
              style={{ background: "var(--color-success)", color: "white" }}
            >
              ✓
            </div>
            <h1 className="text-3xl font-extrabold">Thank you!</h1>
            <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
              Your feedback helps your cleaner and keeps BubbleBox sparkling.
            </p>

            <div
              style={{
                marginTop: 28,
                background: "var(--color-surface)",
                borderRadius: 16,
                padding: "22px 20px",
              }}
            >
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--color-ink)", margin: 0 }}>
                One last thing, if you have 30 seconds. A Google review is the single
                biggest help you can give a small Atlanta business — it&apos;s how the
                next person finds us.
              </p>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
                  color: "white",
                  borderRadius: 50,
                  padding: "14px 30px",
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ⭐ Leave a Google review
              </a>
            </div>

            <Link
              href={
                cleaner && booking?.pro_id
                  ? `/book?pro=${encodeURIComponent(booking.pro_id)}&name=${encodeURIComponent(cleaner.first_name)}`
                  : "/book"
              }
              className="mt-6 inline-block rounded-full px-6 py-3 font-bold no-underline"
              style={{ background: "transparent", color: "var(--color-accent)", border: "1.5px solid var(--color-accent)" }}
            >
              {cleaner ? `🔁 Book ${cleaner.first_name} again` : "Book your next clean"}
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function ReviewForm({
  booking,
  phone,
  onDone,
}: {
  booking: BookingResponse;
  phone: string;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notCompleted = booking.status !== "completed";

  async function submit() {
    if (rating === 0) {
      setError("Tap a star to rate your clean.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          customer_phone: phone,
          rating,
          ...(comment.trim() ? { comment: comment.trim().slice(0, 1000) } : {}),
        }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(body?.error?.message || "Couldn't submit your review — try again.");
        setSubmitting(false);
        return;
      }
      onDone();
    } catch {
      setError("Network error — try again.");
      setSubmitting(false);
    }
  }

  const labels = ["", "Poor", "Fair", "Good", "Great", "Amazing!"];

  return (
    <div>
      <h1 className="text-3xl font-extrabold md:text-4xl">How was your clean?</h1>
      <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
        {booking.service_icon} {booking.service_name} ·{" "}
        {booking.preferred_date
          ? new Date(booking.preferred_date + "T12:00:00").toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })
          : ""}
      </p>

      {notCompleted && (
        <div
          className="mt-6 rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "var(--color-surface)", color: "var(--color-accent-mid)" }}
        >
          This booking isn&apos;t marked complete yet — you can still leave a rating once your clean is done.
        </div>
      )}

      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 44,
              lineHeight: 1,
              padding: 4,
              filter: (hover || rating) >= n ? "none" : "grayscale(1) opacity(0.35)",
              transform: (hover || rating) >= n ? "scale(1.08)" : "scale(1)",
              transition: "all 0.12s",
            }}
          >
            ⭐
          </button>
        ))}
      </div>
      <div
        className="mt-2 text-center text-sm font-bold"
        style={{ color: "var(--color-accent)", minHeight: 20 }}
      >
        {labels[hover || rating]}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything you'd like to share? (optional)"
        rows={4}
        maxLength={1000}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "14px 16px",
          border: "1.5px solid var(--color-surface-mid)",
          borderRadius: 12,
          fontSize: 15,
          fontFamily: "inherit",
          outline: "none",
          resize: "vertical",
        }}
      />

      {error && (
        <div style={{ marginTop: 10, fontSize: 14, color: "var(--color-danger)" }}>{error}</div>
      )}

      <button
        onClick={submit}
        disabled={submitting}
        style={{
          marginTop: 16,
          width: "100%",
          background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
          color: "white",
          border: "none",
          borderRadius: 50,
          padding: 15,
          fontSize: 15,
          fontWeight: 700,
          cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.6 : 1,
          fontFamily: "inherit",
        }}
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}

// ─── Tip step ──────────────────────────────────────────────────────
// Charged to the card already on file from the booking. 100% goes to the
// cleaner. Bookings made before saved cards existed have no card, so a
// no_card_on_file answer skips the step silently rather than showing an error
// for something the customer cannot fix.
function TipStep({
  bookingId,
  phone,
  cleanerName,
  onDone,
}: {
  bookingId: string;
  phone: string;
  cleanerName?: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const who = cleanerName || "your cleaner";

  async function tip(amountCents: number) {
    if (!amountCents || amountCents < 100) {
      setError("Enter at least $1.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/payments/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, customer_phone: phone, amount_cents: amountCents }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        // Nothing the customer can do about a missing card — move on.
        if (body?.error?.code === "no_card_on_file") { onDone(); return; }
        setError(body?.error?.message || "That didn't go through. You can skip this.");
        setBusy(false);
        return;
      }
      onDone();
    } catch {
      setError("Network error — you can skip this.");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold md:text-4xl">Add a tip for {who}?</h1>
      <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
        100% goes to {who} — BubbleBox takes nothing. It goes on the card you
        already used, so there&apos;s nothing to type.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 24 }}>
        {TIP_OPTIONS.map((c) => (
          <button
            key={c}
            onClick={() => tip(c)}
            disabled={busy}
            style={{
              background: "white",
              border: "2px solid var(--color-accent)",
              color: "var(--color-accent)",
              borderRadius: 14,
              padding: "16px 4px",
              fontSize: 17,
              fontWeight: 800,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            ${c / 100}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ""))}
          inputMode="decimal"
          placeholder="Other amount"
          style={{
            flex: 1,
            padding: "13px 15px",
            border: "1.5px solid var(--color-surface-mid)",
            borderRadius: 12,
            fontSize: 15,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          onClick={() => tip(Math.round(parseFloat(custom || "0") * 100))}
          disabled={busy || !custom.trim()}
          style={{
            background: "var(--color-accent)",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "0 22px",
            fontSize: 15,
            fontWeight: 700,
            cursor: busy || !custom.trim() ? "default" : "pointer",
            opacity: busy || !custom.trim() ? 0.5 : 1,
            fontFamily: "inherit",
          }}
        >
          Tip
        </button>
      </div>

      {error && <div style={{ marginTop: 12, fontSize: 14, color: "var(--color-danger)" }}>{error}</div>}

      <button
        onClick={onDone}
        disabled={busy}
        style={{
          marginTop: 20,
          width: "100%",
          background: "transparent",
          border: "none",
          color: "var(--color-muted)",
          fontSize: 14.5,
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "underline",
        }}
      >
        No thanks, continue
      </button>
    </div>
  );
}
