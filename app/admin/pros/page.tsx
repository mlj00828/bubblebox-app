"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchPros,
  fetchPro,
  AdminApiError,
  AdminPro,
  AdminProDetail,
  fmtCents,
  fmtDate,
} from "@/lib/admin-api";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected", "suspended"];

export default function AdminProsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [pros, setPros] = useState<AdminPro[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openPro, setOpenPro] = useState<AdminProDetail | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPros({ status: statusFilter, q: q || undefined, limit: 200 });
      setPros(data.pros);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) router.replace("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q, router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!openId) { setOpenPro(null); return; }
    fetchPro(openId).then(setOpenPro).catch(() => setOpenId(null));
  }, [openId]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pros</h1>
          <div className="page-sub">{total} total · {pros.length} shown</div>
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
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, email…"
          />
        </div>
        <div className="table-wrap">
          {loading ? (
            <div className="empty"><div>Loading…</div></div>
          ) : pros.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🧹</div>
              <div>No pros match.</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>ZIPs</th>
                  <th>Rating</th>
                  <th>Jobs</th>
                  <th>Background</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pros.map((p) => (
                  <tr key={p.id} onClick={() => setOpenId(p.id)}>
                    <td className="cell-name">{p.full_name}</td>
                    <td className="admin-mono cell-sub">{p.phone}</td>
                    <td className="cell-sub">{p.email}</td>
                    <td className="admin-mono cell-sub">{p.zip_codes}</td>
                    <td>{p.avg_rating > 0 ? `★ ${p.avg_rating.toFixed(1)}` : "—"}</td>
                    <td>{p.completed_jobs}</td>
                    <td><span className={`status-badge ${p.background_check_status}`}>{p.background_check_status}</span></td>
                    <td><span className={`status-badge ${p.application_status}`}>{p.application_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {openPro && <ProModal pro={openPro} onClose={() => setOpenId(null)} />}
    </>
  );
}

function ProModal({ pro, onClose }: { pro: AdminProDetail; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title-text">{pro.full_name}</div>
            <div className="card-sub" style={{ marginTop: 4 }}>
              {pro.completed_jobs} jobs · {pro.avg_rating > 0 ? `★ ${pro.avg_rating.toFixed(1)}` : "No rating yet"}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value admin-mono">{pro.phone}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{pro.email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Service ZIPs</div>
              <div className="detail-value admin-mono">{pro.zip_codes}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Services</div>
              <div className="detail-value admin-mono" style={{ fontSize: 12 }}>{pro.services}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Background Check</div>
              <div className="detail-value"><span className={`status-badge ${pro.background_check_status}`}>{pro.background_check_status}</span></div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Application</div>
              <div className="detail-value"><span className={`status-badge ${pro.application_status}`}>{pro.application_status}</span></div>
            </div>
            <div className="detail-row">
              <div className="detail-label">SMS Status</div>
              <div className="detail-value">{pro.sms_opted_out ? "Opted out" : "Subscribed"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Joined</div>
              <div className="detail-value">{fmtDate(pro.created_at)}</div>
            </div>
            {pro.bio && (
              <div className="detail-row" style={{ gridColumn: "1 / -1" }}>
                <div className="detail-label">Bio</div>
                <div className="detail-value">{pro.bio}</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 8 }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Recent Bookings</div>
            {pro.recent_bookings.length === 0 ? (
              <div className="cell-sub">No assignments yet.</div>
            ) : (
              <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pro.recent_bookings.map((b) => (
                      <tr key={b.id} style={{ cursor: "default" }}>
                        <td>{b.preferred_date}</td>
                        <td className="cell-sub">{b.customer_name || "—"}</td>
                        <td><span className={`status-badge ${b.status}`}>{b.status.replace("_", " ")}</span></td>
                        <td className="cell-money">{fmtCents(b.final_total_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
