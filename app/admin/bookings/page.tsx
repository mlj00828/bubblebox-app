"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  assignBooking,
  fetchPros,
  fetchBookings,
  fetchBooking,
  updateBooking,
  AdminApiError,
  AdminBooking,
  BookingStatus,
  fmtCents,
  fmtDateTime,
} from "@/lib/admin-api";
import { applyDiscount } from "@/lib/admin-api";

const STATUS_FILTERS: Array<BookingStatus | "all"> = [
  "all", "requested", "broadcasting", "confirmed", "enroute", "in_progress", "completed", "cancelled",
];

const STATUS_OPTIONS: BookingStatus[] = [
  "requested", "broadcasting", "confirmed", "enroute", "in_progress", "completed", "cancelled",
];

export default function AdminBookingsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const initialStatus = (search.get("status") as BookingStatus | "all" | null) || "all";
  const initialOpen = search.get("open");

  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(initialStatus);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  // Debounce search so we don't fire an API call per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(initialOpen);
  const [openBooking, setOpenBooking] = useState<AdminBooking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBookings({ status: statusFilter, q: debouncedQ || undefined, limit: 100 });
      setBookings(data.bookings);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        router.replace("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedQ, router]);

  useEffect(() => { load(); }, [load]);

  // Open modal when openId is set
  useEffect(() => {
    if (!openId) {
      setOpenBooking(null);
      return;
    }
    fetchBooking(openId).then(setOpenBooking).catch(() => setOpenId(null));
  }, [openId]);

  function closeModal() {
    setOpenId(null);
    setOpenBooking(null);
    // Strip ?open= from URL
    const params = new URLSearchParams(search.toString());
    params.delete("open");
    router.replace(`/admin/bookings${params.toString() ? "?" + params : ""}`);
  }

  async function handleSave(patch: { status?: BookingStatus; notes?: string }) {
    if (!openBooking) return;
    const updated = await updateBooking(openBooking.id, patch);
    setBookings((rows) => rows.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    closeModal();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <div className="page-sub">{total} total · {bookings.length} shown</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div className="filters">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`filter-chip ${statusFilter === s ? "active" : ""}`}
              >
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, ZIP, ID…"
          />
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="empty"><div>Loading…</div></div>
          ) : bookings.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📅</div>
              <div>No bookings match these filters.</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>ZIP</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} onClick={() => setOpenId(b.id)}>
                    <td className="cell-id">{b.id.slice(0, 14)}</td>
                    <td className="cell-name">{b.customer_name || "—"}</td>
                    <td className="admin-mono cell-sub">{b.customer_phone || "—"}</td>
                    <td className="admin-mono">{b.zip}</td>
                    <td>
                      <div>{b.preferred_date}</div>
                      <div className="cell-sub">{b.preferred_window || "—"}</div>
                    </td>
                    <td><span className={`status-badge ${b.status}`}>{b.status.replace("_", " ")}</span></td>
                    <td><span className={`status-badge ${b.payment_status}`}>{b.payment_status}</span></td>
                    <td className="cell-money">{fmtCents(b.final_total_cents ?? b.estimated_total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {openBooking && <BookingModal booking={openBooking} onClose={closeModal} onSave={handleSave} />}
    </>
  );
}

function BookingModal({
  booking,
  onClose,
  onSave,
}: {
  booking: AdminBooking;
  onClose: () => void;
  onSave: (patch: { status?: BookingStatus; notes?: string }) => Promise<void>;
}) {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [notes, setNotes] = useState(booking.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const patch: { status?: BookingStatus; notes?: string } = {};
      if (status !== booking.status) patch.status = status;
      if (notes !== (booking.notes || "")) patch.notes = notes;
      if (Object.keys(patch).length === 0) {
        onClose();
        return;
      }
      await onSave(patch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="modal-header">
          <div>
            <div className="modal-title-text">Booking · <span className="admin-mono" style={{ fontSize: 14 }}>{booking.id.slice(0, 14)}</span></div>
            <div className="card-sub" style={{ marginTop: 4 }}>Created {fmtDateTime(booking.created_at)}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {["requested", "broadcasting"].includes(booking.status) && (
            <AssignSection
              bookingId={booking.id}
              onAssigned={(proName) => {
                alert(`Booking assigned to ${proName}`);
                window.location.reload();
              }}
            />
          )}
          {["pending", "authorized"].includes(booking.payment_status) && !["cancelled", "completed"].includes(booking.status) && (
            <PricingSection booking={booking} />
          )}
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">Customer</div>
              <div className="detail-value">{booking.customer_name || "—"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value admin-mono">{booking.customer_phone || "—"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{booking.customer_email || "—"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Service</div>
              <div className="detail-value">{booking.service_name || booking.service_id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Date</div>
              <div className="detail-value">{booking.preferred_date} · {booking.preferred_time ? `${booking.preferred_time} (30-min arrival window)` : booking.preferred_window}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">ZIP</div>
              <div className="detail-value admin-mono">{booking.zip}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Size</div>
              <div className="detail-value">
                {booking.bedrooms !== null && booking.bedrooms !== undefined
                  ? `${booking.bedrooms} bed · ${booking.bathrooms ?? 0} bath${booking.half_baths ? ` · ${booking.half_baths} half` : ""}`
                  : "— (booked before size tracking)"}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Supplies</div>
              <div className="detail-value" style={{ fontWeight: 700, color: booking.supplies_provided ? "#15803d" : "#b45309" }}>
                {booking.supplies_provided ? "Customer provides" : "Cleaner brings all"}
              </div>
            </div>
            {booking.frequency && booking.frequency !== "once" && (
              <div className="detail-row">
                <div className="detail-label">Frequency</div>
                <div className="detail-value">{booking.frequency}</div>
              </div>
            )}
            <div className="detail-row" style={{ gridColumn: "1 / -1" }}>
              <div className="detail-label">Address</div>
              <div className="detail-value">{booking.address_line || "—"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Cleaner</div>
              <div className="detail-value">{booking.pro_name || "Unassigned"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Total</div>
              <div className="detail-value">{fmtCents(booking.final_total_cents ?? booking.estimated_total_cents)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Payment</div>
              <div className="detail-value">
                <span className={`status-badge ${booking.payment_status}`}>{booking.payment_status}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Stripe PI</div>
              <div className="detail-value admin-mono" style={{ fontSize: 11 }}>
                {booking.stripe_payment_intent_id ? (
                  <a
                    href={`https://dashboard.stripe.com/test/payments/${booking.stripe_payment_intent_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {booking.stripe_payment_intent_id.slice(0, 20)}… ↗
                  </a>
                ) : "—"}
              </div>
            </div>
          </div>

          <div className="field">
            <label className="f-label">Status</label>
            <select className="f-select" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="f-label">Notes</label>
            <textarea
              className="f-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this booking…"
            />
          </div>
          {error && <div className="admin-login-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-blue" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Manual dispatch: assign an open booking to a pro ─────────────
function AssignSection({
  bookingId,
  onAssigned,
}: {
  bookingId: string;
  onAssigned: (proName: string) => void;
}) {
  const [pros, setPros] = useState<Array<{ id: string; full_name: string }>>([]);
  const [proId, setProId] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchPros({ status: "approved", limit: 100 })
      .then((d: any) => setPros((d.pros ?? d ?? []).map((p: any) => ({ id: p.id, full_name: p.full_name }))))
      .catch(() => setErr("Couldn't load pros"));
  }, []);

  async function assign() {
    if (!proId) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await assignBooking(bookingId, proId);
      onAssigned(r.pro_name);
    } catch (e: any) {
      setErr(e?.message || "Assignment failed");
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>
        No cleaner has accepted yet — assign one manually:
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          className="f-input"
          value={proId}
          onChange={(e) => setProId(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">Select a pro…</option>
          {pros.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
        <button className="btn btn-green" onClick={assign} disabled={!proId || busy}>
          {busy ? "Assigning…" : "Assign"}
        </button>
      </div>
      {err && <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>{err}</div>}
    </div>
  );
}


// ─── Pricing adjustment ────────────────────────────────────
// Honor a forgotten promo code or apply a manual discount while the charge
// is still a hold. "BubbleBox absorbs" keeps the cleaner paid on full price.
function PricingSection({ booking }: { booking: AdminBooking }) {
  const [mode, setMode] = useState<"promo" | "amount">("promo");
  const [code, setCode] = useState("BUBBLE20");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Customer forgot promo code at checkout");
  const [absorb, setAbsorb] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const base = booking.estimated_total_cents ?? 0;
  const current = booking.final_total_cents ?? base;
  const basis = booking.payout_basis_cents ?? current;
  const money = (c: number) => `$${(c / 100).toFixed(2)}`;

  async function apply() {
    setBusy(true);
    setErr(null);
    try {
      const r = await applyDiscount(booking.id, {
        promo_code: mode === "promo" ? code.trim() : undefined,
        amount_cents: mode === "amount" ? Math.round(parseFloat(amount || "0") * 100) : undefined,
        reason: reason.trim(),
        absorb,
      });
      setDone(
        `Customer now pays ${money(r.customer_pays_cents)}. Cleaner paid on ${money(r.cleaner_paid_on_cents)} → ${money(r.cleaner_payout_cents)}.`
      );
      setTimeout(() => window.location.reload(), 1600);
    } catch (e: any) {
      setErr(e?.message || "Couldn't apply discount");
      setBusy(false);
    }
  }

  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Pricing</div>
        <div style={{ fontSize: 12, color: "#92400e" }}>
          Work: <strong>{money(base)}</strong>
          {booking.discount_cents ? <> · Discount: <strong>−{money(booking.discount_cents)}</strong>{booking.promo_code ? ` (${booking.promo_code})` : ""}</> : null}
          {" · "}Customer pays: <strong>{money(current)}</strong>
          {" · "}Cleaner paid on: <strong>{money(basis)}</strong>
        </div>
      </div>

      {done ? (
        <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>✓ {done}</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <select className="f-input" value={mode} onChange={(e) => setMode(e.target.value as "promo" | "amount")} style={{ width: 150 }}>
              <option value="promo">Apply promo code</option>
              <option value="amount">Manual $ off</option>
            </select>
            {mode === "promo" ? (
              <input className="f-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BUBBLE20" style={{ width: 130 }} />
            ) : (
              <input className="f-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="20.00" inputMode="decimal" style={{ width: 100 }} />
            )}
            <input className="f-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" style={{ flex: 1, minWidth: 200 }} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#92400e", margin: "10px 0" }}>
            <input type="checkbox" checked={absorb} onChange={(e) => setAbsorb(e.target.checked)} />
            <span><strong>BubbleBox absorbs the discount</strong> — cleaner is still paid on the full {money(base)}. Uncheck to have the cleaner share it.</span>
          </label>
          <button className="btn btn-green" onClick={apply} disabled={busy || reason.trim().length < 3 || (mode === "amount" && !amount)}>
            {busy ? "Applying…" : "Apply adjustment"}
          </button>
          {err && <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>{err}</div>}
          <div style={{ fontSize: 11, color: "#b45309", marginTop: 8 }}>
            Only available while the charge is a hold. After capture, use Payments → Refund instead.
          </div>
        </>
      )}
    </div>
  );
}
