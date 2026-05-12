"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchCustomers,
  fetchCustomer,
  AdminApiError,
  AdminCustomer,
  AdminCustomerDetail,
  fmtCents,
  fmtDate,
} from "@/lib/admin-api";

export default function AdminCustomersPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openCustomer, setOpenCustomer] = useState<AdminCustomerDetail | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers({ q: q || undefined, limit: 200 });
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) router.replace("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [q, router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!openId) { setOpenCustomer(null); return; }
    fetchCustomer(openId).then(setOpenCustomer).catch(() => setOpenId(null));
  }, [openId]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <div className="page-sub">{total} total · {customers.length} shown</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <div></div>
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
          ) : customers.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👤</div>
              <div>No customers match.</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Bookings</th>
                  <th>Total Spent</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} onClick={() => setOpenId(c.id)}>
                    <td className="cell-id">{c.id.slice(0, 14)}</td>
                    <td className="cell-name">{c.name}</td>
                    <td className="admin-mono cell-sub">{c.phone}</td>
                    <td className="cell-sub">{c.email || "—"}</td>
                    <td>{c.booking_count}</td>
                    <td className="cell-money">{fmtCents(c.spent_cents)}</td>
                    <td className="cell-sub">{fmtDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {openCustomer && (
        <CustomerModal customer={openCustomer} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}

function CustomerModal({ customer, onClose }: { customer: AdminCustomerDetail; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title-text">{customer.name}</div>
            <div className="card-sub" style={{ marginTop: 4 }}>
              {customer.booking_count} bookings · {fmtCents(customer.spent_cents)} lifetime
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value admin-mono">{customer.phone}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{customer.email || "—"}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Customer ID</div>
              <div className="detail-value admin-mono" style={{ fontSize: 12 }}>{customer.id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Joined</div>
              <div className="detail-value">{fmtDate(customer.created_at)}</div>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div className="card-title" style={{ marginBottom: 10 }}>Recent Bookings</div>
            {customer.bookings.length === 0 ? (
              <div className="cell-sub">No bookings yet.</div>
            ) : (
              <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 10 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.bookings.map((b) => (
                      <tr key={b.id} style={{ cursor: "default" }}>
                        <td>{b.preferred_date}</td>
                        <td className="cell-sub">{b.service_name || b.service_id}</td>
                        <td><span className={`status-badge ${b.status}`}>{b.status.replace("_", " ")}</span></td>
                        <td className="cell-money">{fmtCents(b.final_total_cents ?? b.estimated_total_cents)}</td>
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
