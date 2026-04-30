"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { fetchBooking, type BookingResponse, formatPhoneForDisplay } from "@/lib/api";
import { formatPrice } from "@/lib/services";

export default function ConfirmPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let phone: string | null = null;
    try {
      phone = sessionStorage.getItem(`booking-phone-${id}`);
    } catch {
      // Storage unavailable
    }

    if (!phone) {
      setError(
        "We can't show your booking details on this device. Check your text messages — your pro will be in touch shortly."
      );
      setLoading(false);
      return;
    }

    fetchBooking(id, phone)
      .then((b) => {
        if (cancelled) return;
        if (!b) {
          setError("We couldn't find that booking. Check your text messages for confirmation.");
        } else {
          setBooking(b);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't reach the server. Check your text messages instead.");
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
            We&apos;re matching you with a pro. You&apos;ll get a text shortly.
          </p>
        </div>

        {loading && (
          <div className="mt-10 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            Loading booking details...
          </div>
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
              <Row label="Status" value={statusLabel(booking.status)} />
            </dl>
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
