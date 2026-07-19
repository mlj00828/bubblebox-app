"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { fetchBooking, toE164USPhone, type BookingResponse } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

type Phase = "verify" | "loading" | "ready" | "done" | "error";

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
          <ReviewForm booking={booking} phone={phone} onDone={() => setPhase("done")} />
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
            <Link
              href={
                cleaner && booking?.pro_id
                  ? `/book?pro=${encodeURIComponent(booking.pro_id)}&name=${encodeURIComponent(cleaner.first_name)}`
                  : "/book"
              }
              className="mt-8 inline-block rounded-full px-6 py-3 font-bold text-white no-underline"
              style={{ background: "var(--color-accent)" }}
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
