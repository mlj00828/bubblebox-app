"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchApplications,
  fetchApplication,
  updateApplication,
  approveApplication,
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
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

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

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleReject(notes: string) {
    if (!openApp) return;
    const updated = await updateApplication(openApp.id, { status: "rejected", review_notes: notes });
    setApps((rows) => rows.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setOpenId(null);
    setOpenApp(null);
    setToast({ kind: "success", text: `${updated.first_name} ${updated.last_name} marked as rejected.` });
  }

  async function handleApprove(notes: string): Promise<void> {
    if (!openApp) return;
    const result = await approveApplication(openApp.id, notes);
    // Refresh the list so the approved row shows new status
    await load();
    setOpenId(null);
    setOpenApp(null);
    setToast({
      kind: "success",
      text: `${result.full_name} approved. Invite email sent to ${result.email}.`,
    });
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
        <ApplicationModal
          app={openApp}
          onClose={() => setOpenId(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {toast && (
        <div className={`approve-toast approve-toast-${toast.kind}`}>
          {toast.text}
        </div>
      )}

      <ToastStyles />
    </>
  );
}

function ApplicationModal({
  app,
  onClose,
  onApprove,
  onReject,
}: {
  app: AdminApplication;
  onClose: () => void;
  onApprove: (notes: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(app.review_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingApprove, setConfirmingApprove] = useState(false);

  async function doReject() {
    setSaving(true);
    setError(null);
    try {
      await onReject(notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
      setSaving(false);
    }
  }

  async function doApprove() {
    setSaving(true);
    setError(null);
    try {
      await onApprove(notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
      setSaving(false);
      setConfirmingApprove(false);
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
          <button className="btn btn-red" onClick={doReject} disabled={saving || app.status !== "pending"}>
            Reject
          </button>
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="btn btn-green"
            onClick={() => setConfirmingApprove(true)}
            disabled={saving || app.status !== "pending"}
          >
            {saving ? "Saving…" : "Approve"}
          </button>
        </div>
      </div>

      {confirmingApprove && (
        <ConfirmApproveModal
          app={app}
          saving={saving}
          onCancel={() => setConfirmingApprove(false)}
          onConfirm={doApprove}
        />
      )}
    </div>
  );
}

function ConfirmApproveModal({
  app,
  saving,
  onCancel,
  onConfirm,
}: {
  app: AdminApplication;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 1100 }}
      onClick={(e) => e.target === e.currentTarget && !saving && onCancel()}
    >
      <div className="admin-modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title-text">Approve {app.first_name} {app.last_name}?</div>
          </div>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: 16, color: "var(--text-mid, #3B5280)", lineHeight: 1.5 }}>
            This will send an invitation email to{" "}
            <strong style={{ color: "var(--text, #0D1B3E)" }}>{app.email}</strong> so they can create
            their cleaner account password. A pro record will be created and they'll be able to sign in at{" "}
            <strong>/login</strong> as a cleaner.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-light, #7B9DC7)", lineHeight: 1.5 }}>
            Double-check the email address is correct. This action can't be easily undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-green" onClick={onConfirm} disabled={saving}>
            {saving ? "Sending invite…" : "Yes, approve & invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Minimal toast styles, scoped to this page
function ToastStyles() {
  return (
    <style jsx global>{`
      .approve-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2000;
        padding: 14px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        animation: toast-slide-in 0.25s ease-out;
      }
      .approve-toast-success {
        background: #16A34A;
        color: white;
      }
      .approve-toast-error {
        background: #DC2626;
        color: white;
      }
      @keyframes toast-slide-in {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `}</style>
  );
}
