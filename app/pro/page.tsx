"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

type Tab = "offers" | "jobs" | "earnings" | "profile";

// Pros keep 80% of every job; BubbleBox's service fee is 20%.
const PRO_SHARE = 0.8;
function payoutDollars(totalCents: number): string {
  return (Math.round(totalCents * PRO_SHARE) / 100).toFixed(2);
}
type JobFilter = "upcoming" | "past" | "all";
type Period = "week" | "month" | "year" | "all";

interface ProRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  bio: string | null;
  photo_url?: string | null;
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
  const [tab, setTab] = useState<Tab>("offers");
  const [offerCount, setOfferCount] = useState(0);

  // Poll for new offers every 30s while the dashboard is open. When the count
  // rises, fire a free browser notification (no Twilio needed) and update the
  // page title so a background tab shows the alert too.
  useEffect(() => {
    if (!accessToken) return;
    let prev = -1; // -1 = first poll, don't notify on initial load
    let stopped = false;

    async function poll() {
      try {
        const resp = await fetch(`${API_BASE}/api/pros/me/offers`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!resp.ok || stopped) return;
        const body = await resp.json();
        const list = Array.isArray(body?.data) ? body.data : body?.data?.offers ?? [];
        const n = list.length;
        setOfferCount(n);
        document.title = n > 0 ? `(${n}) New offers — BubbleBox Pro` : "BubbleBox Pro";
        if (prev >= 0 && n > prev && typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("New cleaning offer! 🫧", {
            body: "A job in your area is up for grabs. First to accept gets it.",
            icon: "/icons/icon-192.png",
            tag: "bubblebox-offer",
          });
        }
        prev = n;
      } catch {
        // transient network error — next poll will retry
      }
    }

    poll();
    const iv = setInterval(poll, 30_000);
    return () => { stopped = true; clearInterval(iv); };
  }, [accessToken]);

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
              <a href="mailto:hello@bubbleboxatl.com" className="link">hello@bubbleboxatl.com</a>.
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
                  ${Math.round((activity.lifetime_earnings_cents * PRO_SHARE) / 100).toLocaleString()}
                </div>
                <div className="hero-stat-label">Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="tabs">
        <button
          className={`tab ${tab === "offers" ? "active" : ""}`}
          onClick={() => setTab("offers")}
        >
          Offers
          {offerCount > 0 && <span className="tab-badge pulse">{offerCount}</span>}
        </button>
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
        {tab === "offers" && (
          <OffersTab
            accessToken={accessToken}
            onCountChange={setOfferCount}
            onAccepted={() => setTab("jobs")}
          />
        )}
        {tab === "jobs" && <JobsTab accessToken={accessToken} />}
        {tab === "earnings" && <EarningsTab accessToken={accessToken} />}
        {tab === "profile" && <ProfileTab pro={pro} email={userEmail} accessToken={accessToken} />}
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

// ── Offers Tab ────────────────────────────────────────────────────
// Uber-style: open offers are shown to every eligible pro; first to accept
// wins the job. Polls every 20s while this tab is open.
interface Offer {
  id: string;
  booking_id?: string;
  status?: string;
  expires_at?: string | null;
  created_at?: string;
  // booking details arrive either flat or nested under `booking`
  booking?: Partial<Job>;
  [key: string]: any;
}

function normalizeOffer(o: Offer): { offer: Offer; job: Partial<Job> } {
  return { offer: o, job: o.booking ?? (o as Partial<Job>) };
}

function OffersTab({
  accessToken,
  onCountChange,
  onAccepted,
}: {
  accessToken: string;
  onCountChange: (n: number) => void;
  onAccepted: () => void;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [notifState, setNotifState] = useState<string>(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  async function load(showSpinner = false) {
    if (showSpinner) setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/pros/me/offers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await resp.json();
      if (!resp.ok) {
        setError(body?.error?.message || `Couldn't load offers (${resp.status})`);
      } else {
        const list: Offer[] = Array.isArray(body.data) ? body.data : body.data?.offers ?? [];
        setOffers(list);
        onCountChange(list.length);
        setError(null);
      }
    } catch (e: any) {
      setError(e?.message || "Couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(true);
    const iv = setInterval(() => load(false), 20_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function act(offerId: string, action: "accept" | "decline") {
    setBusyId(offerId);
    setNotice(null);
    try {
      const resp = await fetch(
        `${API_BASE}/api/pros/me/offers/${offerId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        // 409 = someone else beat them to it — refresh so it disappears
        if (resp.status === 409 || resp.status === 410) {
          setNotice("Sorry — another cleaner grabbed that one first. Keep an eye out for the next offer!");
          await load(false);
        } else {
          setNotice(body?.error?.message || `Couldn't ${action} the offer. Try again.`);
        }
        return;
      }
      if (action === "accept") {
        setNotice("🎉 Job is yours! It's now in your Jobs tab.");
        await load(false);
        setTimeout(onAccepted, 900);
      } else {
        setOffers((prev) => {
          const next = prev.filter((o) => o.id !== offerId);
          onCountChange(next.length);
          return next;
        });
      }
    } catch (e: any) {
      setNotice(e?.message || "Network error — try again.");
    } finally {
      setBusyId(null);
    }
  }

  function enableNotifications() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(setNotifState);
  }

  return (
    <div>
      {notifState === "default" && (
        <button className="notif-banner" onClick={enableNotifications}>
          🔔 Turn on notifications to get alerted the moment a new job drops — tap here
        </button>
      )}
      {notifState === "denied" && (
        <div className="notif-banner muted">
          🔕 Notifications are blocked in your browser settings. Keep this page open — it checks for new offers every 30 seconds.
        </div>
      )}

      {notice && <div className="offer-notice">{notice}</div>}

      {loading ? (
        <div className="loading">Checking for offers…</div>
      ) : error ? (
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <div className="error-title">Couldn&apos;t load offers</div>
          <div className="error-sub">{error}</div>
        </div>
      ) : offers.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">📡</div>
          <div className="empty-title">No open offers right now</div>
          <div className="empty-sub">
            New jobs in your ZIP codes will appear here the moment a customer books.
            This page refreshes automatically — first cleaner to accept gets the job.
          </div>
        </div>
      ) : (
        <div className="bookings-list">
          {offers.map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              busy={busyId === o.id}
              onAccept={() => act(o.id, "accept")}
              onDecline={() => act(o.id, "decline")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({
  offer,
  busy,
  onAccept,
  onDecline,
}: {
  offer: Offer;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { job: j } = normalizeOffer(offer);
  const [now, setNow] = useState(() => Date.now());

  // live countdown if the offer expires
  useEffect(() => {
    if (!offer.expires_at) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [offer.expires_at]);

  const date = j.preferred_date
    ? new Date(j.preferred_date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Date TBD";
  const total = j.final_total_cents ?? j.estimated_total_cents ?? 0;

  let countdown: string | null = null;
  let expired = false;
  if (offer.expires_at) {
    const ms = new Date(offer.expires_at).getTime() - now;
    if (ms <= 0) {
      expired = true;
    } else {
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      countdown = m > 0 ? `${m}m ${s}s` : `${s}s`;
    }
  }

  return (
    <div className="booking-card offer-card">
      <div className="booking-head">
        <div className="booking-svc">
          <span className="booking-icon">{j.service_icon || "🫧"}</span>
          <div>
            <div className="booking-name">{j.service_name || "Cleaning"}</div>
            <div className="booking-id">
              {j.zip ? `ZIP ${j.zip}` : ""}
              {countdown ? ` · ⏱ ${countdown} left` : ""}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="offer-pay">${payoutDollars(total)}</span>
          <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>your payout</div>
        </div>
      </div>

      <dl className="booking-rows">
        <Row label="Date" value={date} />
        <Row label="Window" value={j.preferred_window || "—"} />
        <Row label="Area" value={j.zip ? `ZIP ${j.zip}` : "—"} />
        {j.notes && <Row label="Notes" value={j.notes} />}
      </dl>

      <div className="offer-actions">
        <button
          className="btn-decline"
          onClick={onDecline}
          disabled={busy || expired}
        >
          Pass
        </button>
        <button
          className="btn-accept"
          onClick={onAccept}
          disabled={busy || expired}
        >
          {expired ? "Expired" : busy ? "Working…" : "Accept job ✓"}
        </button>
      </div>
      <div className="offer-fine">
        Customer pays ${Math.round(total / 100)} · your payout is 80% (BubbleBox service fee: 20%).
        Exact address and customer contact are shared after you accept.
      </div>
    </div>
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
          {jobs.map((j) => (
            <JobCard
              key={j.id}
              job={j}
              accessToken={accessToken}
              onStatusChange={(id, status) =>
                setJobs((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({
  job: j,
  accessToken,
  onStatusChange,
}: {
  job: Job;
  accessToken: string;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [released, setReleased] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [captureNote, setCaptureNote] = useState<string | null>(null);

  async function setStatus(next: "enroute" | "in_progress" | "completed") {
    if (next === "completed" && !window.confirm("Mark this job complete? This charges the customer's card for the amount on the booking.")) return;
    setBusy(true);
    setErr(null);
    try {
      const resp = await fetch(`${API_BASE}/api/pros/me/jobs/${j.id}/status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErr(body?.error?.message || "Couldn't update — try again.");
      } else {
        onStatusChange(j.id, next);
        if (next === "completed") {
          setCaptureNote(
            body?.data?.capture?.captured
              ? `✓ Job complete — $${((body.data.capture.amount_cents ?? 0) / 100).toFixed(2)} charged to the customer.`
              : "✓ Job complete. Payment will be settled by BubbleBox."
          );
        }
      }
    } catch {
      setErr("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

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
        <Row label="Customer pays" value={`$${totalDollars}`} />
        <Row label="Your payout (80%)" value={<strong style={{ color: "#15803d" }}>${payoutDollars(total)}</strong>} />
      </dl>

      {["confirmed", "enroute", "in_progress"].includes(j.status) && (
        <div className="job-actions">
          {j.address_line && (j.status === "confirmed" || j.status === "enroute") && (
            <a
              className="btn-nav"
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(j.address_line + (j.zip ? " " + j.zip : ""))}`}
              target="_blank"
              rel="noreferrer"
            >
              🧭 Navigate
            </a>
          )}
          {j.status === "confirmed" && (
            <button className="btn-accept" disabled={busy} onClick={() => setStatus("enroute")}>
              {busy ? "…" : "🚗 On my way"}
            </button>
          )}
          {j.status === "enroute" && (
            <button className="btn-accept" disabled={busy} onClick={() => setStatus("in_progress")}>
              {busy ? "…" : "▶ Start job"}
            </button>
          )}
          {j.status === "in_progress" && (
            <button className="btn-accept" disabled={busy} onClick={() => setStatus("completed")}>
              {busy ? "…" : "✓ Complete job"}
            </button>
          )}
        </div>
      )}
      {["confirmed", "enroute"].includes(j.status) && !released && (
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            onClick={async () => {
              const reason = window.prompt("We get it — things happen. Why can't you make this job? (required)");
              if (!reason || reason.trim().length < 3) return;
              if (!window.confirm("Release this job? It will be offered to other cleaners. Under 24 hours notice counts as a strike.")) return;
              setBusy(true);
              try {
                const r = await fetch(`${API_BASE}/api/pros/me/jobs/${j.id}/cancel`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                  body: JSON.stringify({ reason: reason.trim() }),
                });
                const body = await r.json().catch(() => ({}));
                if (!r.ok) { setErr(body?.error?.message || "Couldn't release the job"); }
                else { setReleased(true); setCaptureNote(body?.data?.message || "Job released."); }
              } catch { setErr("Network error — try again"); }
              finally { setBusy(false); }
            }}
            disabled={busy}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#9ca3af", textDecoration: "underline", fontFamily: "inherit" }}
          >
            Can&apos;t make this job?
          </button>
        </div>
      )}
      {err && <div className="job-err">{err}</div>}
      {captureNote && <div className="job-done">{captureNote}</div>}
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
          <div className="earnings-value">${Math.round((data.period_totals.gross_cents * PRO_SHARE) / 100).toLocaleString()}</div>
          <div className="earnings-sub">{data.period_totals.jobs} {data.period_totals.jobs === 1 ? "job" : "jobs"} completed · take-home</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">Pending</div>
          <div className="earnings-value">${Math.round((data.pending.gross_cents * PRO_SHARE) / 100).toLocaleString()}</div>
          <div className="earnings-sub">{data.pending.jobs} {data.pending.jobs === 1 ? "job" : "jobs"} scheduled · take-home</div>
        </div>
        <div className="earnings-card">
          <div className="earnings-label">Lifetime</div>
          <div className="earnings-value">${Math.round((data.lifetime_totals.gross_cents * PRO_SHARE) / 100).toLocaleString()}</div>
          <div className="earnings-sub">{data.lifetime_totals.jobs} total {data.lifetime_totals.jobs === 1 ? "job" : "jobs"}</div>
        </div>
      </div>

      <div className="earnings-disclaimer">
        All amounts are your take-home earnings (80% of what the customer pays — BubbleBox's service fee is 20%). Payouts are sent directly to you after each completed job.
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
              <div className="completion-amount">${Math.round((r.amount_cents * PRO_SHARE) / 100).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────
function ProfileTab({ pro, email, accessToken }: { pro: ProRecord; email: string; accessToken: string }) {
  const [phone, setPhone] = useState(pro.phone || "");
  const [bio, setBio] = useState(pro.bio || "");
  const [zips, setZips] = useState((pro.zip_codes || []).join(", "));
  const [photoUrl, setPhotoUrl] = useState<string | null>(pro.photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Pull the freshest editable fields (covers photo/bio if /me lags behind)
  useEffect(() => {
    fetch(`${API_BASE}/api/pros/me/profile`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j?.data) return;
        setPhone(j.data.phone || "");
        setBio(j.data.bio || "");
        setZips((j.data.zip_codes || []).join(", "));
        setPhotoUrl(j.data.photo_url ?? null);
      })
      .catch(() => {});
  }, [accessToken]);

  async function uploadPhoto(file: File) {
    setErr(null);
    if (!file.type.startsWith("image/")) { setErr("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setErr("Photo must be under 5 MB."); return; }
    setUploading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) throw new Error("Not signed in");
      const ext = file.type === "image/png" ? "png" : "jpg";
      const path = `${uid}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("pro-photos")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("pro-photos").getPublicUrl(path);
      const url = `${pub.publicUrl}?v=${Date.now()}`;
      const r = await fetch(`${API_BASE}/api/pros/me/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: url }),
      });
      if (!r.ok) throw new Error("Couldn't save the photo");
      setPhotoUrl(url);
      setMsg("Photo updated! Customers now see your face when you're assigned. ✨");
    } catch (e: any) {
      setErr(e?.message || "Upload failed — try again.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setErr(null); setMsg(null);
    const zipList = zips.split(/[\s,]+/).filter(Boolean);
    if (zipList.some((z) => !/^\d{5}$/.test(z))) { setErr("ZIPs must be 5 digits, separated by commas."); return; }
    if (zipList.length === 0) { setErr("Add at least one service ZIP."); return; }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setErr("Enter a valid phone number."); return; }
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/pros/me/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), bio: bio.trim(), zip_codes: zipList }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(body?.error?.message || "Couldn't save — try again."); return; }
      setMsg("Profile saved ✓");
    } catch {
      setErr("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-card">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Profile" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--blue)" }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 }}>
            {(pro.full_name || "?")[0]}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{pro.full_name}</div>
          <label style={{ display: "inline-block", marginTop: 6, fontSize: 13, fontWeight: 700, color: "var(--blue)", cursor: "pointer", textDecoration: "underline" }}>
            {uploading ? "Uploading…" : photoUrl ? "Change photo" : "📷 Add a profile photo"}
            <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.currentTarget.value = ""; }} />
          </label>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Customers see this when you&apos;re their cleaner. A friendly photo wins jobs.</div>
        </div>
      </div>

      <div className="profile-row"><div className="profile-label">Email</div><div className="profile-value">{pro.email || email}</div></div>

      <div style={{ padding: "12px 0", borderBottom: "1px solid #eef2f7" }}>
        <div className="profile-label" style={{ marginBottom: 6 }}>Phone</div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
          style={{ width: "100%", padding: "11px 13px", border: "1.5px solid #dbe4ef", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
      </div>

      <div style={{ padding: "12px 0", borderBottom: "1px solid #eef2f7" }}>
        <div className="profile-label" style={{ marginBottom: 6 }}>Service ZIP codes <span style={{ fontWeight: 400, color: "#9ca3af" }}>(comma-separated — jobs in these ZIPs come to you first)</span></div>
        <input value={zips} onChange={(e) => setZips(e.target.value)} placeholder="30311, 30318, 30310"
          style={{ width: "100%", padding: "11px 13px", border: "1.5px solid #dbe4ef", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
      </div>

      <div style={{ padding: "12px 0", borderBottom: "1px solid #eef2f7" }}>
        <div className="profile-label" style={{ marginBottom: 6 }}>About you <span style={{ fontWeight: 400, color: "#9ca3af" }}>(customers see this — a sentence or two)</span></div>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={400}
          placeholder="e.g. 8 years of residential cleaning experience. I love leaving kitchens spotless!"
          style={{ width: "100%", padding: "11px 13px", border: "1.5px solid #dbe4ef", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
      </div>

      <div className="profile-row"><div className="profile-label">Services</div><div className="profile-value">{pro.services.length ? pro.services.join(", ") : "—"}</div></div>
      <div className="profile-row"><div className="profile-label">Background check</div><div className="profile-value"><span className={`status-pill tone-${pro.background_check_status === "cleared" ? "green" : "blue"}`}>{pro.background_check_status}</span></div></div>
      <div className="profile-row"><div className="profile-label">Account status</div><div className="profile-value"><span className={`status-pill tone-${pro.application_status === "approved" ? "green" : "blue"}`}>{pro.application_status}</span></div></div>

      {err && <div style={{ marginTop: 12, fontSize: 13, color: "#b91c1c", background: "#fef2f2", borderRadius: 8, padding: "8px 12px" }}>{err}</div>}
      {msg && <div style={{ marginTop: 12, fontSize: 13, color: "#15803d", fontWeight: 600, background: "#f0fdf4", borderRadius: 8, padding: "8px 12px" }}>{msg}</div>}

      <button onClick={save} disabled={saving} className="btn-accept" style={{ width: "100%", marginTop: 16 }}>
        {saving ? "Saving…" : "Save profile"}
      </button>
      <div className="profile-note" style={{ marginTop: 12 }}>
        Name, services, or account changes: email <a href="mailto:hello@bubbleboxatl.com" className="link">hello@bubbleboxatl.com</a>.
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
      /* ── Job-day actions ────────────────────── */
      .job-actions { display: flex; gap: 10px; margin-top: 14px; }
      .btn-nav {
        flex: 1; display: flex; align-items: center; justify-content: center;
        padding: 13px; border-radius: 12px; border: 1.5px solid var(--blue);
        color: var(--blue); background: white; font-size: 14px; font-weight: 700;
        text-decoration: none;
      }
      .job-actions .btn-accept { flex: 2; }
      .job-err {
        margin-top: 10px; font-size: 13px; color: #b91c1c;
        background: #fef2f2; border-radius: 8px; padding: 8px 12px;
      }
      .job-done {
        margin-top: 10px; font-size: 13px; color: #15803d; font-weight: 600;
        background: #f0fdf4; border-radius: 8px; padding: 8px 12px;
      }
      /* ── Offers ─────────────────────────────── */
      .offer-card { border: 2px solid var(--blue); }
      .offer-pay {
        font-size: 22px; font-weight: 800; color: var(--blue);
        white-space: nowrap;
      }
      .offer-actions {
        display: flex; gap: 10px; margin-top: 14px;
      }
      .btn-accept {
        flex: 2; padding: 13px; border: none; border-radius: 12px;
        background: linear-gradient(135deg, #16a34a, #15803d);
        color: white; font-size: 15px; font-weight: 800;
        cursor: pointer; font-family: inherit;
      }
      .btn-decline {
        flex: 1; padding: 13px; border-radius: 12px;
        border: 1.5px solid #d1d5db; background: white;
        color: #6b7280; font-size: 15px; font-weight: 700;
        cursor: pointer; font-family: inherit;
      }
      .btn-accept:disabled, .btn-decline:disabled { opacity: 0.5; cursor: default; }
      .offer-fine {
        margin-top: 10px; font-size: 11px; color: #9ca3af; text-align: center;
      }
      .offer-notice {
        background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af;
        border-radius: 12px; padding: 12px 16px; font-size: 14px;
        font-weight: 600; margin-bottom: 14px;
      }
      .notif-banner {
        display: block; width: 100%; text-align: left;
        background: #fefce8; border: 1px solid #fde047; color: #854d0e;
        border-radius: 12px; padding: 12px 16px; font-size: 13px;
        font-weight: 600; margin-bottom: 14px; cursor: pointer;
        font-family: inherit;
      }
      .notif-banner.muted {
        background: #f9fafb; border-color: #e5e7eb; color: #6b7280;
        cursor: default;
      }
      .tab-badge.pulse { animation: bbPulse 2s ease-in-out infinite; }
      @keyframes bbPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.18); }
      }
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
