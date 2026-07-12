"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchBookings,
  capturePayment,
  refundPayment,
  AdminApiError,
  AdminBooking,
  PaymentStatus,
  fmtCents,
  fmtDateTime,
} from "@/lib/admin-api";

const PAYMENT_FILTERS: Array<PaymentStatus | "all"> = [
  "all",
  "authorized",
  "paid",
  "pending",
  "failed",
  "refunded",
];

// Which payment states each action applies to.
const CAPTURABLE: PaymentStatus[] = ["authorized"];
const REFUNDABLE: PaymentStatus[] = ["paid"];

function amountOf(b: AdminBooking): number {
  return b.final_total_cents ?? b.estimated_total_cents ?? 0;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  // Debounce search so we don't fire an API call per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<null | {
    kind: "capture" | "refund";
    booking: AdminBooking;
  }>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Pull a wide window; we filter by payment status client-side since the
      // bookings endpoint filters by booking status, not payment status.
      const data = await fetchBookings({ q: debouncedQ || undefined, limit: 200 });
      setRows(data.bookings);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        router.replace("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, router]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = rows.filter((b) =>
    filter === "all" ? true : b.payment_status === filter
  );

  // Money summary across the currently loaded rows.
  const sum = (pred: (b: AdminBooking) => boolean) =>
    rows.filter(pred).reduce((n, b) => n + amountOf(b), 0);
  const authorizedTotal = sum((b) => b.payment_status === "authorized");
  const capturedTotal = sum((b) => b.payment_status === "paid");
  const refundedTotal = sum((b) => b.payment_status === "refunded");

  function applyResult(id: string, next: PaymentStatus) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, payment_status: next } : r))
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <div className="page-sub">
            Pre-auth holds are captured after the job is completed. {visible.length} shown
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">⏳</div>
          <div className="stat-label">Authorized (held)</div>
          <div className="stat-value">{fmtCents(authorizedTotal)}</div>
          <div className="stat-meta">Not yet charged</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div className="stat-label">Captured</div>
          <div className="stat-value">{fmtCents(capturedTotal)}</div>
          <div className="stat-meta">Charged to customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">↩</div>
          <div className="stat-label">Refunded</div>
          <div className="stat-value">{fmtCents(refundedTotal)}</div>
          <div className="stat-meta">Returned to customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">Σ</div>
          <div className="stat-label">Loaded rows</div>
          <div className="stat-value">{rows.length}</div>
          <div className="stat-meta">Most recent bookings</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="filters">
            {PAYMENT_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`filter-chip ${filter === s ? "active" : ""}`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, ID…"
          />
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty">
              <div>Loading…</div>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">💳</div>
              <div>No payments match this filter.</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Stripe</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => {
                  const canCapture = CAPTURABLE.includes(b.payment_status);
                  const canRefund = REFUNDABLE.includes(b.payment_status);
                  return (
                    <tr key={b.id} style={{ cursor: "default" }}>
                      <td className="cell-id">{b.id.slice(0, 14)}</td>
                      <td>
                        <div className="cell-name">{b.customer_name ?? "—"}</div>
                        <div className="cell-sub">{b.customer_phone ?? ""}</div>
                      </td>
                      <td className="cell-sub">{b.service_name ?? b.service_id}</td>
                      <td className="cell-money">{fmtCents(amountOf(b))}</td>
                      <td>
                        <span className={`status-badge ${b.payment_status}`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="cell-id">
                        {b.stripe_payment_intent_id ? (
                          <a
                            href={`https://dashboard.stripe.com/test/payments/${b.stripe_payment_intent_id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "var(--blue)", textDecoration: "none" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {b.stripe_payment_intent_id.slice(0, 16)}… ↗
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="cell-sub">{fmtDateTime(b.created_at)}</td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {canCapture && (
                          <button
                            className="btn btn-green"
                            onClick={() => setAction({ kind: "capture", booking: b })}
                          >
                            Capture
                          </button>
                        )}
                        {canRefund && (
                          <button
                            className="btn btn-red"
                            onClick={() => setAction({ kind: "refund", booking: b })}
                          >
                            Refund
                          </button>
                        )}
                        {!canCapture && !canRefund && (
                          <span className="cell-sub">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {action && (
        <PaymentActionModal
          kind={action.kind}
          booking={action.booking}
          onClose={() => setAction(null)}
          onDone={(next) => {
            applyResult(action.booking.id, next);
            setAction(null);
          }}
        />
      )}
    </>
  );
}

function PaymentActionModal({
  kind,
  booking,
  onClose,
  onDone,
}: {
  kind: "capture" | "refund";
  booking: AdminBooking;
  onClose: () => void;
  onDone: (next: PaymentStatus) => void;
}) {
  const full = amountOf(booking);
  const [partial, setPartial] = useState(false);
  const [dollars, setDollars] = useState((full / 100).toFixed(2));
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCapture = kind === "capture";
  const amountCents = partial
    ? Math.round(parseFloat(dollars || "0") * 100)
    : undefined;

  async function run() {
    setSubmitting(true);
    setError(null);
    try {
      if (partial && (!amountCents || amountCents <= 0 || amountCents > full)) {
        throw new Error(
          `Enter an amount between $0.01 and ${fmtCents(full)}.`
        );
      }
      const res = isCapture
        ? await capturePayment(booking.id, amountCents)
        : await refundPayment(booking.id, {
            amount_cents: amountCents,
            reason: reason || undefined,
          });
      onDone(res.payment_status ?? (isCapture ? "paid" : "refunded"));
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 404) {
        setError(
          isCapture
            ? "The capture endpoint isn't live on the backend yet (POST /api/admin/bookings/:id/capture). The frontend is ready — deploy that route and this will work."
            : "The refund endpoint isn't live on the backend yet (POST /api/admin/bookings/:id/refund). The frontend is ready — deploy that route and this will work."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-text">
            {isCapture ? "Capture payment" : "Refund payment"}
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">Booking</div>
              <div className="detail-value admin-mono">{booking.id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Customer</div>
              <div className="detail-value">{booking.customer_name ?? "—"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">
                {isCapture ? "Authorized amount" : "Captured amount"}
              </div>
              <div className="detail-value">{fmtCents(full)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Current status</div>
              <div className="detail-value">
                <span className={`status-badge ${booking.payment_status}`}>
                  {booking.payment_status}
                </span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "var(--text-mid)", margin: "4px 0 16px" }}>
            {isCapture
              ? "This charges the customer's card for the amount held at booking. Do this once the job is complete."
              : "This returns money to the customer. A full refund returns the entire captured amount."}
          </p>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-mid)",
              cursor: "pointer",
              marginBottom: partial ? 10 : 0,
            }}
          >
            <input
              type="checkbox"
              checked={partial}
              onChange={(e) => setPartial(e.target.checked)}
            />
            {isCapture ? "Capture a different amount" : "Partial refund"}
          </label>

          {partial && (
            <div className="field">
              <label className="f-label">Amount (USD)</label>
              <input
                className="f-input"
                type="number"
                min="0.01"
                max={(full / 100).toFixed(2)}
                step="0.01"
                value={dollars}
                onChange={(e) => setDollars(e.target.value)}
              />
            </div>
          )}

          {!isCapture && (
            <div className="field">
              <label className="f-label">Reason (optional)</label>
              <input
                className="f-input"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. customer cancelled, service issue"
              />
            </div>
          )}

          {error && (
            <div className="admin-login-error" style={{ marginTop: 14 }}>
              {error}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className={`btn ${isCapture ? "btn-green" : "btn-red"}`}
            onClick={run}
            disabled={submitting}
          >
            {submitting
              ? "Working…"
              : isCapture
              ? `Capture ${partial ? fmtCents(amountCents ?? 0) : fmtCents(full)}`
              : `Refund ${partial ? fmtCents(amountCents ?? 0) : fmtCents(full)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
