"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchStats,
  fetchBookings,
  AdminApiError,
  AdminStats,
  AdminBooking,
  fmtCents,
} from "@/lib/admin-api";
import { useRouter } from "next/navigation";

function pctChange(curr: number, prev: number): { text: string; up: boolean } | null {
  if (prev === 0) return curr > 0 ? { text: "▲ new this month", up: true } : null;
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return { text: "Flat vs last month", up: true };
  return { text: `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs last month`, up: pct > 0 };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [todayBookings, setTodayBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, b] = await Promise.all([
          fetchStats(),
          fetchBookings({ limit: 10 }),
        ]);
        setStats(s);
        const today = new Date().toISOString().slice(0, 10);
        setTodayBookings(b.bookings.filter((bk) => bk.preferred_date === today));
      } catch (err) {
        if (err instanceof AdminApiError && err.status === 401) {
          router.replace("/admin/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>
        Loading dashboard…
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="empty">
        <div className="empty-icon">⚠️</div>
        <div>{error || "Failed to load stats."}</div>
      </div>
    );
  }

  const yesterdayDelta = stats.today_bookings - stats.yesterday_bookings;
  const revenueChange = pctChange(stats.revenue_month_cents, stats.revenue_last_month_cents);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-sub">{today} · Welcome back, admin.</div>
        </div>
        <div className="user-pill">
          <div className="user-avatar">AD</div>
          <div className="user-name">Admin</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-label">Today's Bookings</div>
          <div className="stat-value">{stats.today_bookings}</div>
          <div className={`stat-meta ${yesterdayDelta > 0 ? "up" : yesterdayDelta < 0 ? "down" : ""}`}>
            {yesterdayDelta === 0
              ? "Same as yesterday"
              : `${yesterdayDelta > 0 ? "▲" : "▼"} ${Math.abs(yesterdayDelta)} from yesterday`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📋</div>
          <div className="stat-label">Pending Applications</div>
          <div className="stat-value">{stats.pending_applications}</div>
          <div className="stat-meta">
            {stats.pending_applications > 0 ? "Needs review" : "All caught up"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-label">Revenue This Month</div>
          <div className="stat-value">{fmtCents(stats.revenue_month_cents)}</div>
          {revenueChange && (
            <div className={`stat-meta ${revenueChange.up ? "up" : "down"}`}>{revenueChange.text}</div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🧹</div>
          <div className="stat-label">Active Cleaners</div>
          <div className="stat-value">{stats.active_cleaners}</div>
          <div className="stat-meta">Approved &amp; cleared</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Today's Bookings</div>
              <div className="card-sub">
                {todayBookings.length === 0
                  ? "Nothing scheduled today"
                  : `${todayBookings.length} ${todayBookings.length === 1 ? "booking" : "bookings"}`}
              </div>
            </div>
            <Link href="/admin/bookings" className="btn btn-ghost">View all →</Link>
          </div>
          {todayBookings.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📅</div>
              <div>No bookings for today yet.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Window</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map((b) => (
                    <tr key={b.id} onClick={() => router.push(`/admin/bookings?open=${b.id}`)}>
                      <td className="admin-mono">{b.preferred_window || "—"}</td>
                      <td className="cell-name">{b.customer_name || "—"}</td>
                      <td>{b.service_name || b.service_id}</td>
                      <td><span className={`status-badge ${b.status}`}>{b.status.replace("_", " ")}</span></td>
                      <td className="cell-money">{fmtCents(b.final_total_cents ?? b.estimated_total_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div className="card-header">
            <div className="card-title">Quick Links</div>
          </div>
          <div className="activity-list">
            <Link href="/admin/applications?status=pending" className="activity-row" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="activity-dot" style={{ background: "var(--orange-bg)", color: "var(--orange-dark)" }}>📋</div>
              <div className="activity-main">
                <div className="activity-title">
                  <strong>{stats.pending_applications}</strong> applications pending review
                </div>
                <div className="activity-time">Tap to review →</div>
              </div>
            </Link>
            <Link href="/admin/bookings?status=requested" className="activity-row" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="activity-dot" style={{ background: "var(--blue-bg)", color: "var(--blue-dark)" }}>📅</div>
              <div className="activity-main">
                <div className="activity-title">Unassigned bookings</div>
                <div className="activity-time">View requested →</div>
              </div>
            </Link>
            <Link href="/admin/customers" className="activity-row" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="activity-dot" style={{ background: "var(--green-bg)", color: "var(--green-dark)" }}>👤</div>
              <div className="activity-main">
                <div className="activity-title">All customers</div>
                <div className="activity-time">View list →</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
