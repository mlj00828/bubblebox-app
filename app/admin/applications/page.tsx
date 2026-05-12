"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchApplications,
  fetchApplication,
  updateApplication,
  AdminApiError,
  AdminApplication,
  ApplicationStatus,
  fmtDateTime,
} from "@/lib/admin-api";

const STATUS_FILTERS: Array<ApplicationStatus | "all"> = ["all", "pending", "approved", "rejected"];

export default function AdminApplicationsPage() {
  const router = useRouter();
  const search = useSearchParams();
  const initialStatus = (search.get("status") as ApplicationStatus | "all" | null) || "pending";

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(initialStatus);
  const [q, setQ] = useState("");
  const [apps, setApps] = useState<AdminApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openApp, setOpenApp] = useState<AdminApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApplications({ status: statusFilter, q: q || undefined, limit: 100 });
      setApps(data.applications);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) router.replace("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q, router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!openId) { setOpenApp(null); return; }
    fetchApplication(openId).then(setOpenApp).catch(() => setOpenId(null));
  }, [openId]);

  async function handleSave(patch: { status?: ApplicationStatus; review_notes?: string }) {
    if (!openApp) return;
    const updated = await updateApplication(openApp.id, patch);
    setApps((rows) => rows.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setOpenId(null);
    setOpenApp(null);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pro Applications</h1>
          <div className="page-sub">{total} total · {apps.length} shown</div>
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
          ) : apps.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div>No applications match.</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>ZIPs</th>
                  <th>Services</th>
                  <th>Experience</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} onClick={() => setOpenId(a.id)}>
                    <td className="cell-sub">{fmtDateTime(a.submitted_at)}</td>
                    <td className="cell-name">{a.first_name} {a.last_name}</td>
                    <td>
                      <div className="admin-mono cell-sub">{a.phone}</div>
                      <div className="cell-sub">{a.email}</div>
                    </td>
                    <td className="admin-mono cell-sub">{a.service_zips}</td>
                    <td className="cell-sub">{a.services}</td>
                    <td>{a.years_experience || "—"}</td>
                    <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {openApp && (
        <ApplicationModal app={openApp} onClose={() => setOpenId(null)} onSave={handleSave} />
      )}
    </>
  );
}

function ApplicationModal({
  app,
  onClose,
  onSave,
}: {
  app: AdminApplication;
  onClose: () => void;
  onSave: (patch: { status?: ApplicationStatus; review_notes?: string }) => Promise<void>;
}) {
  const [notes, setNotes] = useState(app.review_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(status: ApplicationStatus) {
    setSaving(true);
    setError(null);
    try {
      await onSave({ status, review_notes: notes });
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
            <div className="modal-title-text">{app.first_name} {app.last_name}</div>
            <div className="card-sub" style={{ marginTop: 4 }}>Submitted {fmtDateTime(app.submitted_at)}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value admin-mono">{app.phone}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{app.email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Service ZIPs</div>
              <div className="detail-value admin-mono">{app.service_zips}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Experience</div>
              <div className="detail-value">{app.years_experience || "—"}</div>
            </div>
            <div className="detail-row" style={{ gridColumn: "1 / -1" }}>
              <div className="detail-label">Services</div>
              <div className="detail-value">{app.services}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Insurance</div>
              <div className="detail-value">{app.has_insurance ? "✓ Yes" : "✗ No"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Transportation</div>
              <div className="detail-value">{app.has_transportation ? "✓ Yes" : "✗ No"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">IP Address</div>
              <div className="detail-value admin-mono" style={{ fontSize: 12 }}>{app.ip_address || "—"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Current Status</div>
              <div className="detail-value">
                <span className={`status-badge ${app.status}`}>{app.status}</span>
              </div>
            </div>
          </div>

          <div className="field">
            <label className="f-label">Review Notes</label>
            <textarea
              className="f-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why approving or rejecting?"
            />
          </div>
          {error && <div className="admin-login-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-red" onClick={() => decide("rejected")} disabled={saving}>
            Reject
          </button>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-green" onClick={() => decide("approved")} disabled={saving}>
            {saving ? "Saving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
