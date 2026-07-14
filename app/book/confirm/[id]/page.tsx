"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { fetchBooking, type BookingResponse, formatPhoneForDisplay, toE164USPhone } from "@/lib/api";
import { formatPrice } from "@/lib/services";

export default function ConfirmPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    let phone: string | null = null;
    try {
      phone = sessionStorage.getItem(`booking-phone-${id}`);
    } catch {
      // Storage unavailable
    }
    setPhone(phone);

    if (!phone) {
      setNeedsPhone(true);
      setLoading(false);
      return;
    }

    fetchBooking(id, phone)
      .then((b) => {
        if (cancelled) return;
        if (!b) {
          setError("We couldn't find a booking matching that phone number.");
        } else {
          setBooking(b);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't reach the server — please try again in a moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-20">
        <div className="text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ background: "var(--color-success)" }}
          >
            ✓
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Booking received
          </h1>
          <p className="mt-3 text-lg" style={{ color: "var(--color-muted)" }}>
            We&apos;re matching you with a cleaner — track it live below.
          </p>
        </div>

        {loading && (
          <div className="mt-10 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            Loading booking details...
          </div>
        )}

        {needsPhone && !booking && (
          <form
            className="mt-10 rounded-2xl p-6"
            style={{ background: "white", border: "1.5px solid var(--color-rule)" }}
            onSubmit={(e) => {
              e.preventDefault();
              const e164 = toE164USPhone(phoneInput);
              if (!e164) {
                setError("Enter a valid 10-digit US phone number.");
                return;
              }
              try {
                sessionStorage.setItem(`booking-phone-${id}`, e164);
              } catch {
                // storage unavailable
              }
              window.location.reload();
            }}
          >
            <div className="mb-1 text-base font-bold">Confirm your phone number</div>
            <p className="mb-4 text-sm" style={{ color: "var(--color-muted)" }}>
              Enter the number you booked with to see your booking and live status.
            </p>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="(404) 555-0199"
              style={{ width: "100%", padding: "14px 16px", border: "1.5px solid var(--color-surface-mid)", borderRadius: 12, fontSize: 16, fontFamily: "inherit", outline: "none" }}
            />
            <button
              type="submit"
              style={{ marginTop: 14, width: "100%", background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", border: "none", borderRadius: 50, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              View my booking
            </button>
          </form>
        )}

        {error && (
          <div
            className="mt-10 rounded-xl p-5 text-sm"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-rule)",
              color: "var(--color-ink)",
            }}
          >
            {error}
          </div>
        )}

        {booking && (
          <div
            className="mt-10 overflow-hidden rounded-2xl"
            style={{
              background: "white",
              border: "1px solid var(--color-rule)",
            }}
          >
            <div
              className="flex items-center justify-between p-5"
              style={{ background: "var(--color-surface)" }}
            >
              <div>
                <div className="text-lg font-bold">
                  {booking.service_icon} {booking.service_name}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Booking #{booking.id.replace(/^bk_/, "")}
                </div>
              </div>
              <div
                className="text-2xl font-extrabold"
                style={{ color: "var(--color-accent-deep)" }}
              >
                {formatPrice(booking.estimated_total_cents)}
              </div>
            </div>

            <dl className="divide-y" style={{ borderColor: "var(--color-rule)" }}>
              <Row label="When" value={`${formatDate(booking.preferred_date)} · ${booking.preferred_window}`} />
              <Row label="Where" value={booking.address_line} />
              <Row label="Customer" value={booking.customer_name} />
              <Row label="Phone" value={formatPhoneForDisplay(booking.customer_phone)} />
            </dl>
            {phone && <StatusTracker id={booking.id} phone={phone} initialStatus={booking.status} />}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="rounded-full px-6 py-3 font-bold text-white no-underline"
            style={{ background: "var(--color-accent)" }}
          >
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: "var(--color-muted)" }}>
          Questions? Email{" "}
          <a href="mailto:bubbleboxusa@gmail.com" className="underline">
            bubbleboxusa@gmail.com
          </a>
        </p>
      </main>

      <Footer />
    </>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

const TRACK_STEPS = [
  { key: "broadcasting", label: "Finding your cleaner", icon: "📡" },
  { key: "confirmed", label: "Cleaner assigned", icon: "🙋" },
  { key: "enroute", label: "On the way", icon: "🚗" },
  { key: "in_progress", label: "Cleaning in progress", icon: "🧽" },
  { key: "completed", label: "Sparkling clean!", icon: "✨" },
];
const STATUS_ORDER = ["requested", "broadcasting", "confirmed", "enroute", "in_progress", "completed"];

function StatusTracker({ id, phone, initialStatus }: { id: string; phone: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [pro, setPro] = useState<{ first_name: string | null; avg_rating: number | null } | null>(null);

  useEffect(() => {
    if (status === "completed" || status === "cancelled") return;
    let stopped = false;
    async function poll() {
      try {
        const r = await fetch(`${API_BASE}/api/bookings/${id}/track?phone=${encodeURIComponent(phone)}`);
        if (!r.ok || stopped) return;
        const j = await r.json();
        if (j?.data?.status) setStatus(j.data.status);
        if (j?.data?.pro) setPro(j.data.pro);
      } catch {
        // transient — next poll retries
      }
    }
    poll();
    const iv = setInterval(poll, 15_000);
    return () => { stopped = true; clearInterval(iv); };
  }, [id, phone, status]);

  if (status === "cancelled") {
    return (
      <div className="px-5 py-4 text-sm font-semibold" style={{ color: "var(--color-danger)" }}>
        This booking was cancelled.
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="px-5 py-5" style={{ borderTop: "1px solid var(--color-rule)" }}>
      <div className="mb-4 text-sm font-bold" style={{ color: "var(--color-ink)" }}>
        Live status
        <span className="ml-2 text-xs font-medium" style={{ color: "var(--color-muted)" }}>
          updates automatically
        </span>
      </div>
      {pro?.first_name && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "var(--color-surface)" }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            {pro.first_name[0]}
          </div>
          <div>
            <div className="text-sm font-bold">{pro.first_name} is your cleaner</div>
            {pro.avg_rating ? (
              <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                ★ {Number(pro.avg_rating).toFixed(1)} rating
              </div>
            ) : null}
          </div>
        </div>
      )}
      <div>
        {TRACK_STEPS.map((step) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const done = currentIdx > stepIdx;
          const active = currentIdx === stepIdx || (step.key === "broadcasting" && status === "requested");
          return (
            <div key={step.key} className="flex items-center gap-3 py-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                style={{
                  background: done ? "var(--color-success)" : active ? "var(--color-accent)" : "var(--color-surface)",
                  color: done || active ? "white" : "var(--color-muted)",
                  transition: "all 0.3s",
                }}
              >
                {done ? "✓" : step.icon}
              </div>
              <div
                className="text-sm"
                style={{
                  fontWeight: active ? 700 : 500,
                  color: done || active ? "var(--color-ink)" : "var(--color-muted)",
                }}
              >
                {step.label}
                {active && status !== "completed" && (
                  <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--color-accent)" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {status === "completed" && (
        <Link
          href={`/review/${id}`}
          className="mt-4 block rounded-full py-3 text-center font-bold text-white no-underline"
          style={{ background: "var(--color-accent)" }}
        >
          ⭐ Rate your clean
        </Link>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-5 py-3 text-sm">
      <dt style={{ color: "var(--color-muted)" }}>{label}</dt>
      <dd className="text-right font-medium" style={{ color: "var(--color-ink)" }}>
        {value}
      </dd>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    broadcasting: "Finding a pro",
    pending: "Waiting for a pro",
    confirmed: "Pro confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}
