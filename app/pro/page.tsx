"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

type Tab = "jobs" | "earnings" | "profile";
type JobFilter = "upcoming" | "past" | "all";
type Period = "week" | "month" | "year" | "all";

interface ProRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string | null;
  zip_codes: string[];
  services: string[];
  avg_rating: number;
  completed_jobs: number;
  background_check_status: string;
  application_status: string;
  sms_opted_out: boolean;
  created_at: string;
}

interface Activity {
  total_jobs: number;
  completed_jobs: number;
  active_jobs: number;
  lifetime_earnings_cents: number;
}

interface MeResponse {
  pro: ProRecord;
  activity: Activity;
}

interface Job {
  id: string;
  status: string;
  preferred_date: string;
  preferred_window: string | null;
  scheduled_start_at: string | null;
  zip: string;
  address_line: string | null;
  notes: string | null;
  estimated_total_cents: number | null;
  final_total_cents: number | null;
  payment_status: string;
  created_at: string;
  service_name: string | null;
  service_icon: string | null;
  customer_name: string | null;
  customer_phone: string | null;
}

interface EarningsResponse {
  period: Period;
  period_start: string;
  period_totals: { jobs: number; gross_cents: number };
  lifetime_totals: { jobs: number; gross_cents: number };
  pending: { jobs: number; gross_cents: number };
  recent_completions: Array<{
    id: string;
    preferred_date: string;
    amount_cents: number;
    service_name: string | null;
    customer_name: string | null;
  }>;
}

export default function ProPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("jobs");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!sessionData?.session) {
        setAuthed(false);
        setLoading(false);
        return;
      }

      setAuthed(true);
      setUserEmail(sessionData.session.user?.email || "");
      setAccessToken(sessionData.session.access_token);

      try {
        const resp = await fetch(`${API_BASE}/api/pros/me`, {
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        });
        const body = await resp.json();
        if (cancelled) return;
        if (!resp.ok) {
          setError(body?.error?.message || `Couldn't load your account (${resp.status})`);
          setErrorCode(body?.error?.code || null);
        } else {
          setMe(body.data as MeResponse);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Couldn't reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAuthed(false);
        setMe(null);
        setAccessToken("");
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // ── Not signed in ─────────────────────────────────────────────
  if (!loading && authed === false) {
    return (
      <div className="page">
        <Topbar />
        <main className="shell signin-shell">
          <div className="signin-card">
            <div className="signin-icon">🔒</div>
            <h1 className="signin-title">Cleaner sign-in required</h1>
            <p className="signin-sub">
              You need to sign in as an approved BubbleBox cleaner to access this dashboard.
            </p>
            <Link href="/login" className="btn-primary signin-cta">
              Sign in
            </Link>
            <div className="signin-foot">
              Want to become a BubbleBox cleaner?{" "}
              <Link href="/join" className="link">Apply here</Link>
            </div>
          </div>
        </main>
        <PageStyles />
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page">
        <Topbar />
        <main className="shell">
          <div className="loading">Loading your dashboard…</div>
        </main>
        <PageStyles />
      </div>
    );
  }

  // ── Error: not a pro (covers "no pros row" cases) ─────────────
  if (errorCode === "not_a_pro") {
    return (
      <div className="page">
        <Topbar onSignOut={handleSignOut} />
        <main className="shell signin-shell">
          <div className="signin-card">
            <div className="signin-icon">🧽</div>
            <h1 className="signin-title">Not a cleaner account</h1>
            <p className="signin-sub">
              This page is for approved BubbleBox cleaners. If you applied recently, your
              application may still be pending review. Questions? Email{" "}
              <a href="mailto:bubbleboxusa@gmail.com" className="link">bubbleboxusa@gmail.com</a>.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" className="btn-outline">Go home</Link>
              <Link href="/join" className="btn-primary">Apply now</Link>
            </div>
          </div>
        </main>
        <PageStyles />
      </div>
    );
  }

  // ── Other error ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page">
        <Topbar onSignOut={handleSignOut} />
        <main className="shell">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Couldn't load your dashboard</div>
            <div className="error-sub">{error}</div>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        </main>
        <PageStyles />
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────
  const pro = me!.pro;
  const activity = me!.activity;
  const firstName = pro.full_name.split(" ")[0] || "there";

  return (
    <div className="page">
      <Topbar onSignOut={handleSignOut} />

      <div className="hero">
        <div className="hero-inner">
          <div className="hero-row">
            <div>
              <h1 className="greeting">Welcome back, {firstName}</h1>
              <p className="greeting-sub">
                {activity.active_jobs > 0
                  ? `You have ${activity.active_jobs} active ${
                      activity.active_jobs === 1 ? "job" : "jobs"
                    }`
                  : "No active jobs right now"}
              </p>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">{activity.completed_jobs}</div>
                <div className="hero-stat-label">Jobs done</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">
                  {pro.avg_rating > 0 ? pro.avg_rating.toFixed(1) : "—"}
                </div>
                <div className="hero-stat-label">Rating</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">
                  ${Math.round(activity.lifetime_earnings_cents / 100).toLocaleString()}
                </div>
                <div className="hero-stat-label">Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="tabs">
        <button
          className={`tab ${tab === "jobs" ? "active" : ""}`}
          onClick={() => setTab("jobs")}
        >
          Jobs
          {activity.active_jobs > 0 && <span className="tab-badge">{activity.active_jobs}</span>}
        </button>
        <button
          className={`tab ${tab === "earnings" ? "active" : ""}`}
          onClick={() => setTab("earnings")}
        >
          Earnings
        </button>
        <button
          className={`tab ${tab === "profile" ? "active" : ""}`}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
      </nav>

      <main className="shell">
        {tab === "jobs" && <JobsTab accessToken={accessToken} />}
        {tab === "earnings" && <EarningsTab accessToken={accessToken} />}
        {tab === "profile" && <ProfileTab pro={pro} email={userEmail} />}
      </main>

      <PageStyles />
    </div>
  );
}

// ── Topbar (header) ───────────────────────────────────────────────
function Topbar({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <header className="topbar">
      <Link href="/" className="topbar-logo">
        <div className="topbar-name">BubbleBox ATL</div>
        <div className="topbar-sub">Cleaner Dashboard</div>
      </Link>
      {onSignOut && (
        <button onClick={onSignOut} className="signout-btn">Sign out</button>
      )}
    </header>
  );
}

// ── Jobs Tab ──────────────────────────────────────────────────────
function JobsTab({ accessToken }: { accessToken: string }) {
  const [filter, setFilter] = useState<JobFilter>("upcoming");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `${API_BASE}/api/pros/me/jobs?status=${filter}&limit=100`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const body = await resp.json();
        if (cancelled) return;
        if (!resp.ok) {
          setError(body?.error?.message || "Couldn't load jobs");
        } else {
          setJobs(body.data.jobs || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Couldn't load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [filter, accessToken]);

  return (
    <div>
      <div className="filter-bar">
        {(["upcoming", "past", "all"] as JobFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-chip ${filter === f ? "active" : ""}`}
          >
            {f === "upcoming" ? "Upcoming" : f === "past" ? "Past" : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading jobs…</div>
      ) : error ? (
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <div className="error-title">Couldn't load jobs</div>
          <div className="error-sub">{error}</div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">🫧</div>
          <div className="empty-title">
            {filter === "upcoming" ? "No upcoming jobs" : filter === "past" ? "No past jobs" : "No jobs yet"}
          </div>
          <div className="empty-sub">
            {filter === "upcoming"
              ? "When the admin assigns you a booking, it'll show up here."
              : "Once you start completing cleanings, your history will appear here."}
          </div>
        </div>
      ) : (
        <div className="bookings-list">
          {jobs.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </div>
  );
}

function JobCard({ job: j }: { job: Job }) {
  const date = j.preferred_date
    ? new Date(j.preferred_date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Date TBD";
  const total = j.final_total_cents ?? j.estimated_total_cents ?? 0;
  const totalDollars = (total / 100).toFixed(0);

  const statusLabels: Record<string, { label: string; tone: string }> = {
    requested: { label: "New offer", tone: "blue" },
    broadcasting: { label: "Awaiting", tone: "blue" },
    confirmed: { label: "Confirmed", tone: "green" },
    enroute: { label: "En route", tone: "green" },
    in_progress: { label: "In progress", tone: "green" },
    completed: { label: "Completed", tone: "gray" },
    cancelled: { label: "Cancelled", tone: "red" },
  };
  const status = statusLabels[j.status] ?? { label: j.status, tone: "gray" };

  return (
    <div className="booking-card">
      <div className="booking-head">
        <div className="booking-svc">
          <span className="booking-icon">{j.service_icon || "🧽"}</span>
          <div>
            <div className="booking-name">{j.service_name || "Cleaning"}</div>
            <div className="booking-id">#{j.id.replace(/^bk_/, "").toUpperCase()}</div>
          </div>
        </div>
        <span className={`status-pill tone-${status.tone}`}>{status.label}</span>
      </div>

      <dl className="booking-rows">
        <Row label="Date" value={date} />
        <Row label="Window" value={j.preferred_window || "—"} />
        <Row label="Customer" value={j.customer_name || "—"} />
        {j.customer_phone && (
          <Row
            label="Phone"
            value={
              <a href={`tel:${j.customer_phone}`} className="link">
                {j.customer_phone}
              </a>
            }
          />
        )}
        <Row label="Address" value={j.address_line || `ZIP ${j.zip}`} />
        {j.notes && <Row label="Notes" value={j.notes} />}
        <Row label="Total" value={<strong>${totalDollars}</strong>} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="booking-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// ── Earnings Tab ──────────────────────────────────────────────────
function EarningsTab({ accessToken }: { accessToken: string }) {
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `${API_BASE}/api/pros/me/earnings?period=${period}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const body = await resp.json();
        if (cancelled) return;
        if (!resp.ok) {
          setError(body?.error?.message || "Couldn't load earnings");
        } else {
          setData(body.data as EarningsResponse);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Couldn't load earnings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [period, accessToken]);

  if (loading) return <div className="loading">Loading earnings…</div>;

  if (error) {
    return (
      <div className="error-card">
        <div className="error-icon">⚠️</div>
        <div className="error-title">Couldn't load earnings</div>
        <div className="error-sub">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="filter-bar">
        {(["week", "month", "year", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`filter-chip ${period === p ? "active" : ""}`}
          >
            {p === "week" ? "This week" : p === "month" ? "This month" : p === "year" ? "This year" : "All time"}
          </button>
        ))}
      </div>

      <div className="earnings-grid">
        <div className="earnings-card primary">
          <div className="earnings-label">
            {period === "week" ? "This week" : period === "month" ? "This month" : period === "year" ? "This year" : "Lifetime"}
          </div>
          <div className="earnings-value">${Math.round(data.period_totals.gross_cents / 100).toLocaleString()}</div>
          <div className="earnings-sub">{data.period_totals.jobs} {data.period_totals.jobs === 1 ? "job" : "jobs"} completed</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">Pending</div>
          <div className="earnings-value">${Math.round(data.pending.gross_cents / 100).toLocaleString()}</div>
          <div className="earnings-sub">{data.pending.jobs} {data.pending.jobs === 1 ? "job" : "jobs"} scheduled</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">Lifetime</div>
          <div className="earnings-value">${Math.round(data.lifetime_totals.gross_cents / 100).toLocaleString()}</div>
          <div className="earnings-sub">{data.lifetime_totals.jobs} total {data.lifetime_totals.jobs === 1 ? "job" : "jobs"}</div>
        </div>
      </div>

      <div className="earnings-disclaimer">
        Amounts shown are gross totals (what the customer paid). Once payouts are set up, you'll see your earnings after platform fees.
      </div>

      <h3 className="section-title">Recent completed jobs</h3>
      {data.recent_completions.length === 0 ? (
        <div className="empty-card small">
          <div className="empty-sub">No completed jobs yet.</div>
        </div>
      ) : (
        <div className="completion-list">
          {data.recent_completions.map((r) => (
            <div key={r.id} className="completion-row">
              <div>
                <div className="completion-service">{r.service_name || "Cleaning"}</div>
                <div className="completion-sub">
                  {new Date(r.preferred_date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {" · "}
                  {r.customer_name || "Customer"}
                </div>
              </div>
              <div className="completion-amount">${Math.round(r.amount_cents / 100).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────
function ProfileTab({ pro, email }: { pro: ProRecord; email: string }) {
  return (
    <div className="profile-card">
      <ProfileRow label="Name" value={pro.full_name} />
      <ProfileRow label="Email" value={pro.email || email} />
      <ProfileRow label="Phone" value={pro.phone} />
      <ProfileRow
        label="Service ZIPs"
        value={pro.zip_codes.length ? pro.zip_codes.join(", ") : "—"}
      />
      <ProfileRow
        label="Services"
        value={pro.services.length ? pro.services.join(", ") : "—"}
      />
      <ProfileRow
        label="Background check"
        value={
          <span className={`status-pill tone-${pro.background_check_status === "cleared" ? "green" : "blue"}`}>
            {pro.background_check_status}
          </span>
        }
      />
      <ProfileRow
        label="Account status"
        value={
          <span className={`status-pill tone-${pro.application_status === "approved" ? "green" : "blue"}`}>
            {pro.application_status}
          </span>
        }
      />
      <ProfileRow
        label="Cleaner since"
        value={new Date(pro.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      />
      <div className="profile-note">
        Profile editing is coming soon. To update any of these details, email{" "}
        <a href="mailto:bubbleboxusa@gmail.com" className="link">bubbleboxusa@gmail.com</a>.
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="profile-row">
      <div className="profile-label">{label}</div>
      <div className="profile-value">{value}</div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
function PageStyles() {
  return (
    <style jsx global>{`
      :root {
        --blue: #1D7FE8;
        --blue-dark: #0A2FA8;
        --blue-mid: #2563EB;
        --blue-light: #60B4FF;
        --blue-pale: #D6EEFF;
        --blue-bg: #EBF5FF;
        --bg: #F5FBFF;
        --text: #0D1B3E;
        --text-mid: #3B5280;
        --text-light: #7B9DC7;
        --border: #C8E0F8;
        --surface: #F0F8FF;
        --surface-mid: #DCE9F7;
        --green: #16A34A;
        --green-bg: #DCFCE7;
        --green-dark: #15803D;
      }
      .page {
        font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
        min-height: 100vh;
        color: var(--text);
        background: var(--bg);
        display: flex;
        flex-direction: column;
      }
      .topbar {
        background: white;
        border-bottom: 1px solid var(--border);
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .topbar-logo { text-decoration: none; color: inherit; }
      .topbar-name { font-size: 18px; font-weight: 800; color: var(--blue-dark); letter-spacing: -0.3px; }
      .topbar-sub { font-size: 11px; font-weight: 600; color: var(--text-light); letter-spacing: 0.5px; text-transform: uppercase; }
      .signout-btn {
        background: none;
        border: 1.5px solid var(--border);
        color: var(--text-mid);
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 50px;
        cursor: pointer;
      }
      .signout-btn:hover { border-color: var(--blue); color: var(--blue); }

      .hero {
        background: linear-gradient(135deg, var(--blue-bg) 0%, var(--bg) 100%);
        padding: 36px 24px 28px;
      }
      .hero-inner { max-width: 880px; margin: 0 auto; }
      .hero-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        flex-wrap: wrap;
      }
      .greeting {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 32px;
        letter-spacing: -0.5px;
        color: var(--text);
        line-height: 1.1;
      }
      .greeting-sub {
        font-size: 15px;
        color: var(--text-mid);
        margin-top: 6px;
      }
      .hero-stats {
        display: flex;
        gap: 20px;
      }
      .hero-stat {
        text-align: center;
        min-width: 64px;
      }
      .hero-stat-value {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 26px;
        color: var(--blue-dark);
        line-height: 1;
      }
      .hero-stat-label {
        font-size: 11px;
        color: var(--text-light);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 4px;
      }

      .tabs {
        background: white;
        border-bottom: 1px solid var(--border);
        display: flex;
        gap: 4px;
        padding: 0 24px;
        max-width: 880px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      }
      .tab {
        background: none;
        border: none;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-mid);
        padding: 14px 16px;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 3px solid transparent;
        transition: all 0.15s;
      }
      .tab:hover { color: var(--blue); }
      .tab.active { color: var(--blue); border-bottom-color: var(--blue); }
      .tab-badge {
        background: var(--blue);
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 99px;
        min-width: 20px;
        text-align: center;
      }

      .shell {
        flex: 1;
        max-width: 880px;
        margin: 0 auto;
        width: 100%;
        padding: 24px;
        box-sizing: border-box;
      }

      .loading {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-mid);
      }

      .filter-bar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }
      .filter-chip {
        background: white;
        border: 1.5px solid var(--border);
        color: var(--text-mid);
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .filter-chip:hover { border-color: var(--blue); color: var(--blue); }
      .filter-chip.active {
        background: var(--blue);
        color: white;
        border-color: var(--blue);
      }

      .empty-card, .signin-card, .error-card {
        background: white;
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 48px 28px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(29,127,232,0.06);
      }
      .empty-card.small { padding: 20px; }
      .empty-icon, .signin-icon, .error-icon { font-size: 48px; margin-bottom: 12px; }
      .empty-title, .signin-title, .error-title {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 24px;
        color: var(--text);
        margin-bottom: 8px;
        letter-spacing: -0.3px;
      }
      .empty-sub, .signin-sub, .error-sub {
        font-size: 14px;
        color: var(--text-mid);
        line-height: 1.5;
        max-width: 420px;
        margin: 0 auto 20px;
      }
      .signin-shell { display: flex; align-items: center; }
      .signin-cta { display: inline-block; text-decoration: none; }
      .signin-foot { margin-top: 16px; font-size: 13px; color: var(--text-mid); }

      .btn-primary, .btn-outline {
        display: inline-block;
        border-radius: 50px;
        padding: 13px 28px;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-primary {
        background: linear-gradient(135deg, var(--blue), var(--blue-mid));
        color: white;
        border: none;
        box-shadow: 0 4px 16px rgba(29,127,232,0.35);
      }
      .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(29,127,232,0.4); }
      .btn-outline {
        background: white;
        color: var(--text);
        border: 1.5px solid var(--border);
      }
      .btn-outline:hover { border-color: var(--blue); color: var(--blue); }

      .link {
        color: var(--blue);
        font-weight: 600;
        text-decoration: none;
      }
      .link:hover { text-decoration: underline; }

      .bookings-list { display: flex; flex-direction: column; gap: 14px; }
      .booking-card {
        background: white;
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 18px 20px;
        box-shadow: 0 2px 12px rgba(29,127,232,0.05);
      }
      .booking-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        padding-bottom: 14px;
        margin-bottom: 14px;
        border-bottom: 1px solid var(--surface-mid);
      }
      .booking-svc { display: flex; gap: 12px; align-items: center; }
      .booking-icon { font-size: 28px; }
      .booking-name { font-size: 16px; font-weight: 700; color: var(--text); }
      .booking-id { font-family: monospace; font-size: 11px; color: var(--text-light); margin-top: 2px; }

      .status-pill {
        font-size: 11px;
        font-weight: 700;
        padding: 5px 11px;
        border-radius: 99px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        display: inline-block;
      }
      .tone-blue { background: var(--blue-bg); color: var(--blue-dark); }
      .tone-green { background: var(--green-bg); color: var(--green-dark); }
      .tone-gray { background: var(--surface); color: var(--text-mid); }
      .tone-red { background: #FEE2E2; color: #B91C1C; }

      .booking-rows { display: flex; flex-direction: column; gap: 8px; }
      .booking-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 14px;
      }
      .booking-row dt { color: var(--text-mid); }
      .booking-row dd { color: var(--text); font-weight: 500; text-align: right; }

      .earnings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }
      .earnings-card {
        background: white;
        border: 1.5px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(29,127,232,0.05);
      }
      .earnings-card.primary {
        background: linear-gradient(135deg, var(--blue), var(--blue-mid));
        border-color: var(--blue);
        color: white;
        box-shadow: 0 6px 20px rgba(29,127,232,0.25);
      }
      .earnings-card.primary .earnings-label,
      .earnings-card.primary .earnings-sub {
        color: rgba(255,255,255,0.85);
      }
      .earnings-label {
        font-size: 12px;
        color: var(--text-mid);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .earnings-value {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 32px;
        line-height: 1;
        margin-bottom: 6px;
      }
      .earnings-sub {
        font-size: 13px;
        color: var(--text-light);
      }
      .earnings-disclaimer {
        font-size: 12px;
        color: var(--text-light);
        line-height: 1.5;
        padding: 12px 16px;
        background: var(--surface);
        border-radius: 10px;
        margin-bottom: 24px;
      }
      .section-title {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 20px;
        margin: 0 0 14px;
        color: var(--text);
        letter-spacing: -0.3px;
      }
      .completion-list {
        background: white;
        border: 1.5px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
      }
      .completion-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        border-bottom: 1px solid var(--surface-mid);
        gap: 12px;
      }
      .completion-row:last-child { border-bottom: none; }
      .completion-service { font-size: 14px; font-weight: 600; color: var(--text); }
      .completion-sub { font-size: 12px; color: var(--text-light); margin-top: 2px; }
      .completion-amount {
        font-size: 16px;
        font-weight: 700;
        color: var(--green-dark);
      }

      .profile-card {
        background: white;
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 2px 12px rgba(29,127,232,0.05);
      }
      .profile-row {
        display: flex;
        justify-content: space-between;
        padding: 14px 0;
        border-bottom: 1px solid var(--surface-mid);
        gap: 12px;
        align-items: center;
      }
      .profile-row:last-of-type { border-bottom: none; }
      .profile-label { font-size: 13px; color: var(--text-mid); font-weight: 600; }
      .profile-value { font-size: 15px; color: var(--text); font-weight: 500; text-align: right; }
      .profile-note {
        margin-top: 18px;
        padding: 14px;
        background: var(--blue-bg);
        border-radius: 12px;
        font-size: 13px;
        color: var(--text-mid);
        line-height: 1.5;
        text-align: center;
      }

      @media (max-width: 640px) {
        .hero-row { flex-direction: column; }
        .hero-stats { width: 100%; justify-content: space-between; }
      }
    `}</style>
  );
}
