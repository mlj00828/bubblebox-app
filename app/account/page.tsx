"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

type Tab = "upcoming" | "past" | "profile";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  status: string;
  service_id: string;
  service_name: string | null;
  service_icon: string | null;
  zip: string;
  address_line: string | null;
  preferred_date: string;
  preferred_window: string | null;
  scheduled_start_at: string | null;
  notes: string | null;
  estimated_total_cents: number | null;
  final_total_cents: number | null;
  payment_status: string;
  promo_code: string | null;
  discount_cents: number | null;
  pro_name: string | null;
  created_at: string;
}

interface AccountData {
  customer: CustomerData | null;
  bookings: Booking[];
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Wait for Supabase to settle any in-URL session.
      // detectSessionInUrl: true in our supabase client means it'll auto-parse
      // an access_token in the URL hash on first load.
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!sessionData?.session) {
        setAuthed(false);
        setLoading(false);
        return;
      }

      setAuthed(true);
      setUserEmail(sessionData.session.user?.email || "");

      try {
        const resp = await fetch(`${API_BASE}/api/customers/me`, {
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        });
        const body = await resp.json();
        if (cancelled) return;
        if (!resp.ok) {
          setError(body?.error?.message || `Couldn't load your account (${resp.status})`);
        } else {
          setData(body.data as AccountData);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Couldn't reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAuthed(false);
        setData(null);
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
        <header className="topbar">
          <Link href="/" className="topbar-logo">
            <div className="topbar-name">BubbleBox ATL</div>
            <div className="topbar-sub">Atlanta&apos;s #1 Cleaning</div>
          </Link>
        </header>

        <main className="shell signin-shell">
          <div className="signin-card">
            <div className="signin-icon">🔒</div>
            <h1 className="signin-title">You&apos;re not signed in</h1>
            <p className="signin-sub">
              Sign in to view your bookings, manage your profile, and track upcoming cleanings.
            </p>
            <Link href="/login" className="btn-primary signin-cta">
              Sign in
            </Link>
            <div className="signin-foot">
              Don&apos;t have an account? <Link href="/login" className="link">Create one</Link>
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
        <header className="topbar">
          <Link href="/" className="topbar-logo">
            <div className="topbar-name">BubbleBox ATL</div>
            <div className="topbar-sub">Atlanta&apos;s #1 Cleaning</div>
          </Link>
        </header>
        <main className="shell">
          <div className="loading">Loading your account…</div>
        </main>
        <PageStyles />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page">
        <header className="topbar">
          <Link href="/" className="topbar-logo">
            <div className="topbar-name">BubbleBox ATL</div>
            <div className="topbar-sub">Atlanta&apos;s #1 Cleaning</div>
          </Link>
        </header>
        <main className="shell">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Couldn&apos;t load your account</div>
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

  // ── Main account view ─────────────────────────────────────────
  const customer = data?.customer ?? null;
  const allBookings = data?.bookings ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = allBookings.filter(
    (b) => b.preferred_date >= today && b.status !== "cancelled" && b.status !== "completed"
  );
  const past = allBookings.filter(
    (b) => b.preferred_date < today || b.status === "cancelled" || b.status === "completed"
  );

  const greetingName = customer?.name?.split(" ")[0] || userEmail.split("@")[0] || "there";

  return (
    <div className="page">
      <header className="topbar">
        <Link href="/" className="topbar-logo">
          <div className="topbar-name">BubbleBox ATL</div>
          <div className="topbar-sub">Atlanta&apos;s #1 Cleaning</div>
        </Link>
        <button onClick={handleSignOut} className="signout-btn">Sign out</button>
      </header>

      <div className="hero">
        <div className="hero-inner">
          <h1 className="greeting">Hi, {greetingName}</h1>
          <p className="greeting-sub">
            {customer
              ? `Welcome back to your BubbleBox account`
              : `Once you book a cleaning, your details will show up here.`}
          </p>
        </div>
      </div>

      <nav className="tabs">
        <button
          className={`tab ${tab === "upcoming" ? "active" : ""}`}
          onClick={() => setTab("upcoming")}
        >
          Upcoming
          {upcoming.length > 0 && <span className="tab-badge">{upcoming.length}</span>}
        </button>
        <button
          className={`tab ${tab === "past" ? "active" : ""}`}
          onClick={() => setTab("past")}
        >
          Past
          {past.length > 0 && <span className="tab-badge muted">{past.length}</span>}
        </button>
        <button
          className={`tab ${tab === "profile" ? "active" : ""}`}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
      </nav>

      <main className="shell">
        {tab === "upcoming" && (
          <BookingsList
            bookings={upcoming}
            emptyTitle="No upcoming cleanings"
            emptySub="Book your next cleaning to see it here."
            showCta
          />
        )}
        {tab === "past" && (
          <BookingsList
            bookings={past}
            emptyTitle="No past cleanings yet"
            emptySub="Once a cleaning is completed, it'll show up here."
          />
        )}
        {tab === "profile" && (
          <ProfileSection
            customer={customer}
            email={userEmail}
          />
        )}
      </main>

      <PageStyles />
    </div>
  );
}

// ── Bookings list ─────────────────────────────────────────────────
function BookingsList({
  bookings,
  emptyTitle,
  emptySub,
  showCta = false,
}: {
  bookings: Booking[];
  emptyTitle: string;
  emptySub: string;
  showCta?: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <div className="empty-card">
        <div className="empty-icon">🫧</div>
        <div className="empty-title">{emptyTitle}</div>
        <div className="empty-sub">{emptySub}</div>
        {showCta && (
          <Link href="/book" className="btn-primary empty-cta">
            Book a Cleaning
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="bookings-list">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}

function BookingCard({ booking: b }: { booking: Booking }) {
  const date = b.preferred_date
    ? new Date(b.preferred_date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Date TBD";
  const total = b.final_total_cents ?? b.estimated_total_cents ?? 0;
  const totalDollars = (total / 100).toFixed(0);
  const statusLabels: Record<string, { label: string; tone: string }> = {
    requested: { label: "Requested", tone: "blue" },
    broadcasting: { label: "Finding a pro", tone: "blue" },
    confirmed: { label: "Confirmed", tone: "green" },
    enroute: { label: "Pro en route", tone: "green" },
    in_progress: { label: "In progress", tone: "green" },
    completed: { label: "Completed", tone: "gray" },
    cancelled: { label: "Cancelled", tone: "red" },
  };
  const status = statusLabels[b.status] ?? { label: b.status, tone: "gray" };

  return (
    <div className="booking-card">
      <div className="booking-head">
        <div className="booking-svc">
          <span className="booking-icon">{b.service_icon || "🧽"}</span>
          <div>
            <div className="booking-name">{b.service_name || "Cleaning"}</div>
            <div className="booking-id">#{b.id.replace(/^bk_/, "").toUpperCase()}</div>
          </div>
        </div>
        <span className={`status-pill tone-${status.tone}`}>{status.label}</span>
      </div>

      <dl className="booking-rows">
        <Row label="Date" value={date} />
        <Row label="Window" value={b.preferred_window || "—"} />
        <Row label="Address" value={b.address_line || `ZIP ${b.zip}`} />
        {b.pro_name && <Row label="Pro" value={b.pro_name} />}
        {b.promo_code && (
          <Row
            label="Promo"
            value={
              <span style={{ color: "#16a34a" }}>
                {b.promo_code} (−${((b.discount_cents ?? 0) / 100).toFixed(0)})
              </span>
            }
          />
        )}
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

// ── Profile (read-only for now) ──────────────────────────────────
function ProfileSection({
  customer,
  email,
}: {
  customer: CustomerData | null;
  email: string;
}) {
  return (
    <div className="profile-card">
      <div className="profile-row">
        <div className="profile-label">Name</div>
        <div className="profile-value">{customer?.name || "—"}</div>
      </div>
      <div className="profile-row">
        <div className="profile-label">Email</div>
        <div className="profile-value">{customer?.email || email || "—"}</div>
      </div>
      <div className="profile-row">
        <div className="profile-label">Phone</div>
        <div className="profile-value">{customer?.phone || "—"}</div>
      </div>
      {customer?.created_at && (
        <div className="profile-row">
          <div className="profile-label">Customer since</div>
          <div className="profile-value">
            {new Date(customer.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      )}
      <div className="profile-note">
        Profile editing is coming soon. To update any of these details, email{" "}
        <a href="mailto:bubbleboxusa@gmail.com" className="link">bubbleboxusa@gmail.com</a>.
      </div>
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
      .topbar-logo {
        text-decoration: none;
        color: inherit;
      }
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
      .hero-inner { max-width: 720px; margin: 0 auto; }
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

      .tabs {
        background: white;
        border-bottom: 1px solid var(--border);
        display: flex;
        gap: 4px;
        padding: 0 24px;
        max-width: 720px;
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
      .tab-badge.muted { background: var(--surface-mid); color: var(--text-mid); }

      .shell {
        flex: 1;
        max-width: 720px;
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

      .empty-card, .signin-card, .error-card {
        background: white;
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 48px 28px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(29,127,232,0.06);
      }
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
        max-width: 360px;
        margin: 0 auto 20px;
      }
      .signin-shell { display: flex; align-items: center; }
      .signin-cta { display: inline-block; text-decoration: none; }
      .signin-foot { margin-top: 16px; font-size: 13px; color: var(--text-mid); }

      .btn-primary {
        display: inline-block;
        background: linear-gradient(135deg, var(--blue), var(--blue-mid));
        color: white;
        border: none;
        border-radius: 50px;
        padding: 13px 28px;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(29,127,232,0.35);
        transition: all 0.2s;
      }
      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(29,127,232,0.4);
      }

      .empty-cta { display: inline-block; text-decoration: none; }

      .link {
        color: var(--blue);
        font-weight: 600;
        text-decoration: none;
      }
      .link:hover { text-decoration: underline; }

      .bookings-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
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
      }
      .tone-blue { background: var(--blue-bg); color: var(--blue-dark); }
      .tone-green { background: #DCFCE7; color: #15803D; }
      .tone-gray { background: var(--surface); color: var(--text-mid); }
      .tone-red { background: #FEE2E2; color: #B91C1C; }

      .booking-rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .booking-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 14px;
      }
      .booking-row dt { color: var(--text-mid); }
      .booking-row dd { color: var(--text); font-weight: 500; text-align: right; }

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
    `}</style>
  );
}
