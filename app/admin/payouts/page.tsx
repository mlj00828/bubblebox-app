"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPayouts,
  markPayoutPaid,
  unmarkPayoutPaid,
  updateProTax,
  type Payout,
  type PayoutSummary,
} from "@/lib/admin-api";

const money = (c: number | null | undefined) => `$${((c ?? 0) / 100).toFixed(2)}`;

const METHODS = ["zelle", "cashapp", "venmo", "check", "cash", "other"] as const;

export default function PayoutsPage() {
  const [items, setItems] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary[]>([]);
  const [totals, setTotals] = useState({ owed_cents: 0, paid_cents: 0 });
  const [year, setYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState<"owed" | "paid" | "all">("owed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [method, setMethod] = useState<string>("zelle");
  const [reference, setReference] = useState("");
  const [bonus, setBonus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetchPayouts(filter);
      setItems(r.data.items);
      setSummary(r.data.summary);
      setTotals(r.data.totals);
      setYear(r.data.year);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load payouts");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmPay(p: Payout) {
    try {
      await markPayoutPaid(p.id, {
        method,
        reference: reference.trim() || undefined,
        bonus_cents: bonus ? Math.round(parseFloat(bonus) * 100) : undefined,
      });
      setPayingId(null);
      setReference("");
      setBonus("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't mark paid");
    }
  }

  async function toggleW9(s: PayoutSummary) {
    try {
      await updateProTax(s.pro_id, { w9_received: !s.w9_received });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update W-9 status");
    }
  }

  return (
    <div className="admin-pane">
      <div className="pane-head">
        <div>
          <h1 className="pane-title">Payouts</h1>
          <p className="pane-sub">
            What you owe each cleaner, and what you&apos;ve paid. Cleaners keep 80% of what the
            customer pays.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14, marginBottom: 22 }}>
        <div className="stat-card" style={{ borderLeft: "4px solid #b45309" }}>
          <div className="stat-label">Currently owed</div>
          <div className="stat-value">{money(totals.owed_cents)}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #15803d" }}>
          <div className="stat-label">Paid all time</div>
          <div className="stat-value">{money(totals.paid_cents)}</div>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* ── Per-cleaner summary ── */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px" }}>By cleaner</h2>
      <div className="admin-table-wrap" style={{ marginBottom: 30 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cleaner</th>
              <th>Jobs</th>
              <th>Owed</th>
              <th>Paid ({year})</th>
              <th>Pay to</th>
              <th>W-9</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>
                  No completed jobs yet.
                </td>
              </tr>
            )}
            {summary.map((s) => (
              <tr key={s.pro_id}>
                <td>
                  <strong>{s.full_name}</strong>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.email}</div>
                </td>
                <td>{s.job_count}</td>
                <td style={{ fontWeight: 800, color: s.owed_cents ? "#b45309" : "#9ca3af" }}>
                  {money(s.owed_cents)}
                </td>
                <td>
                  {money(s.ytd_paid_cents)}
                  {s.needs_1099 && (
                    <span
                      title="Over $600 this year — a 1099-NEC is required"
                      style={{ marginLeft: 6, background: "#fef3c7", color: "#92400e", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 6 }}
                    >
                      1099
                    </span>
                  )}
                </td>
                <td style={{ fontSize: 12 }}>
                  {s.payout_handle ? (
                    <>
                      {s.payout_handle}
                      <div style={{ color: "#9ca3af" }}>{s.payout_method}</div>
                    </>
                  ) : (
                    <span style={{ color: "#9ca3af" }}>—</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => toggleW9(s)}
                    style={{
                      background: s.w9_received ? "#dcfce7" : "#fee2e2",
                      color: s.w9_received ? "#15803d" : "#b91c1c",
                      border: "none",
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {s.w9_received ? "On file" : "Missing"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Job-by-job ledger ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 10px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Ledger</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {(["owed", "paid", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "var(--admin-accent, #1D7FE8)" : "white",
                color: filter === f ? "white" : "#3B5280",
                border: "1.5px solid #dbe4ef",
                borderRadius: 50,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Cleaner</th>
              <th>Job</th>
              <th>Customer paid</th>
              <th>Cleaner earns</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#9ca3af" }}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#9ca3af" }}>
                  Nothing here.
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p.id}>
                <td style={{ whiteSpace: "nowrap" }}>{p.earned_at}</td>
                <td>{p.pro_name}</td>
                <td style={{ fontSize: 12 }}>
                  {p.service_id}
                  <div style={{ color: "#9ca3af" }}>
                    {p.zip} · {p.booking_id.slice(0, 12)}
                  </div>
                </td>
                <td>{money(p.gross_cents)}</td>
                <td style={{ fontWeight: 800 }}>
                  {money(p.amount_cents + (p.bonus_cents || 0))}
                  {p.bonus_cents > 0 && (
                    <div style={{ fontSize: 10, color: "#15803d" }}>incl. {money(p.bonus_cents)} bonus</div>
                  )}
                </td>
                <td>
                  <span
                    style={{
                      background: p.status === "paid" ? "#dcfce7" : "#fef3c7",
                      color: p.status === "paid" ? "#15803d" : "#92400e",
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {p.status}
                  </span>
                  {p.method && (
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                      {p.method}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  {p.status === "owed" ? (
                    payingId === p.id ? (
                      <div style={{ display: "flex", gap: 5, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        <select
                          value={method}
                          onChange={(e) => setMethod(e.target.value)}
                          style={{ padding: "5px 8px", borderRadius: 8, border: "1.5px solid #dbe4ef", fontSize: 12, fontFamily: "inherit" }}
                        >
                          {METHODS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <input
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="ref #"
                          style={{ width: 80, padding: "5px 8px", borderRadius: 8, border: "1.5px solid #dbe4ef", fontSize: 12, fontFamily: "inherit" }}
                        />
                        <input
                          value={bonus}
                          onChange={(e) => setBonus(e.target.value)}
                          placeholder="bonus $"
                          inputMode="decimal"
                          style={{ width: 74, padding: "5px 8px", borderRadius: 8, border: "1.5px solid #dbe4ef", fontSize: 12, fontFamily: "inherit" }}
                        />
                        <button className="btn-sm btn-primary" onClick={() => confirmPay(p)}>
                          Confirm
                        </button>
                        <button className="btn-sm" onClick={() => setPayingId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="btn-sm btn-primary" onClick={() => setPayingId(p.id)}>
                        Mark paid
                      </button>
                    )
                  ) : (
                    <button
                      className="btn-sm"
                      onClick={async () => {
                        await unmarkPayoutPaid(p.id);
                        load();
                      }}
                    >
                      Undo
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16, lineHeight: 1.6 }}>
        Rows are created automatically when a job is completed and paid. A cleaner paid $600 or more
        in a calendar year needs a 1099-NEC — collect a W-9 before their first payout.
      </p>
    </div>
  );
}
