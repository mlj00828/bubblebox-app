"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Wrapping component to satisfy Next.js requirement that useSearchParams be inside Suspense
export default function SetPasswordPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <SetPasswordInner />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <div className="page">
      <Topbar />
      <main className="shell">
        <div className="loading">Loading…</div>
      </main>
      <PageStyles />
    </div>
  );
}

function SetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Context: is this a NEW user from an invite link, or an EXISTING signed-in user changing their password?
  // We detect this from:
  //   - URL hash: #access_token=...&type=invite|recovery → new user setting password for first time
  //   - signed-in session with no invite hash → user changing their password
  const [context, setContext] = useState<"invite" | "recovery" | "change" | "checking">("checking");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Check URL hash for invite/recovery token (Supabase puts these in the hash, not query)
      // Note: useSearchParams gives us query string, not hash. We need to read window.location.hash directly.
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      let detectedType: "invite" | "recovery" | null = null;
      if (hash.includes("type=invite")) detectedType = "invite";
      else if (hash.includes("type=recovery")) detectedType = "recovery";

      // Also check ?type= query param (some Supabase configs use this)
      const queryType = searchParams.get("type");
      if (!detectedType && (queryType === "invite" || queryType === "recovery")) {
        detectedType = queryType;
      }

      // Wait for Supabase to settle any in-URL session token
      // detectSessionInUrl: true in our supabase client auto-parses these on first load
      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionData?.session) {
        setUserEmail(sessionData.session.user?.email || "");
        setUserRole(sessionData.session.user?.user_metadata?.role || "");

        if (detectedType === "invite") {
          setContext("invite");
        } else if (detectedType === "recovery") {
          setContext("recovery");
        } else {
          setContext("change");
        }
      } else {
        // No session and no detected token = user landed here without auth
        // Could be a broken invite link or someone just typing the URL
        setContext("change"); // will show "you must be signed in" message
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "Couldn't set your password. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);

      // Clear the hash from URL so a refresh doesn't re-trigger anything
      if (typeof window !== "undefined" && window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      // Redirect based on role after a short success display
      setTimeout(() => {
        if (userRole === "pro") {
          router.push("/pro");
        } else {
          router.push("/account");
        }
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Couldn't set your password.");
      setSubmitting(false);
    }
  }

  // ── No session at all (someone visited /set-password directly without being signed in) ──
  if (context === "change" && !userEmail) {
    return (
      <div className="page">
        <Topbar />
        <main className="shell signin-shell">
          <div className="signin-card">
            <div className="signin-icon">🔒</div>
            <h1 className="signin-title">Sign in to change your password</h1>
            <p className="signin-sub">
              You need to be signed in to change your password. If you're a new cleaner setting up
              your account, please use the invitation link in your welcome email.
            </p>
            <Link href="/login" className="btn-primary">Sign in</Link>
          </div>
        </main>
        <PageStyles />
      </div>
    );
  }

  if (context === "checking") {
    return <LoadingShell />;
  }

  // ── Success state ────────────────────────────────────────────
  if (success) {
    return (
      <div className="page">
        <Topbar />
        <main className="shell signin-shell">
          <div className="signin-card">
            <div className="signin-icon">✅</div>
            <h1 className="signin-title">Password set!</h1>
            <p className="signin-sub">
              {context === "invite"
                ? "Welcome to BubbleBox ATL! Taking you to your dashboard…"
                : "Your password has been updated. Redirecting…"}
            </p>
          </div>
        </main>
        <PageStyles />
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────
  const heading = context === "invite"
    ? "Welcome to BubbleBox ATL"
    : context === "recovery"
    ? "Reset your password"
    : "Change your password";

  const subheading = context === "invite"
    ? "Set a password to finish setting up your account."
    : context === "recovery"
    ? "Choose a new password for your account."
    : "Enter a new password for your account.";

  return (
    <div className="page">
      <Topbar />
      <main className="shell signin-shell">
        <div className="form-card">
          <h1 className="form-title">{heading}</h1>
          <p className="form-sub">{subheading}</p>
          {userEmail && (
            <p className="form-email">
              <strong>{userEmail}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="f-label" htmlFor="pw">New password</label>
              <input
                id="pw"
                type="password"
                className="f-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                disabled={submitting}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div className="field">
              <label className="f-label" htmlFor="pw-confirm">Confirm password</label>
              <input
                id="pw-confirm"
                type="password"
                className="f-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={submitting}
                placeholder="Type it again"
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button
              type="submit"
              className="btn-primary form-submit"
              disabled={submitting || !password || !confirmPassword}
            >
              {submitting
                ? "Setting password…"
                : context === "invite"
                ? "Finish setup"
                : "Update password"}
            </button>

            {context === "change" && (
              <div className="form-foot">
                <Link href={userRole === "pro" ? "/pro" : "/account"} className="link">
                  Cancel and go back
                </Link>
              </div>
            )}
          </form>
        </div>
      </main>
      <PageStyles />
    </div>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <Link href="/" className="topbar-logo">
        <div className="topbar-name">BubbleBox ATL</div>
        <div className="topbar-sub">Atlanta&apos;s #1 Cleaning</div>
      </Link>
    </header>
  );
}

function PageStyles() {
  return (
    <style jsx global>{`
      :root {
        --blue: #1D7FE8;
        --blue-dark: #0A2FA8;
        --blue-mid: #2563EB;
        --blue-bg: #EBF5FF;
        --bg: #F5FBFF;
        --text: #0D1B3E;
        --text-mid: #3B5280;
        --text-light: #7B9DC7;
        --border: #C8E0F8;
        --surface: #F0F8FF;
        --red: #DC2626;
        --red-bg: #FEE2E2;
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
      }
      .topbar-logo {
        text-decoration: none;
        color: inherit;
        display: inline-block;
      }
      .topbar-name {
        font-size: 18px;
        font-weight: 800;
        color: var(--blue-dark);
        letter-spacing: -0.3px;
      }
      .topbar-sub {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-light);
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .shell {
        flex: 1;
        max-width: 480px;
        margin: 0 auto;
        width: 100%;
        padding: 40px 24px;
        box-sizing: border-box;
      }
      .signin-shell {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .loading {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-mid);
      }
      .signin-card, .form-card {
        background: white;
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 36px 28px;
        box-shadow: 0 4px 20px rgba(29,127,232,0.06);
        width: 100%;
      }
      .signin-card { text-align: center; }
      .signin-icon { font-size: 48px; margin-bottom: 12px; }
      .signin-title, .form-title {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 26px;
        color: var(--text);
        margin-bottom: 10px;
        letter-spacing: -0.3px;
        line-height: 1.2;
      }
      .signin-sub, .form-sub {
        font-size: 14px;
        color: var(--text-mid);
        line-height: 1.5;
        margin-bottom: 18px;
      }
      .form-email {
        font-size: 14px;
        color: var(--text);
        margin-bottom: 24px;
        padding: 10px 14px;
        background: var(--surface);
        border-radius: 10px;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .f-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-mid);
      }
      .f-input {
        font-family: inherit;
        font-size: 15px;
        padding: 12px 14px;
        border: 1.5px solid var(--border);
        border-radius: 10px;
        background: white;
        color: var(--text);
        transition: border-color 0.15s;
      }
      .f-input:focus {
        outline: none;
        border-color: var(--blue);
      }
      .f-input:disabled {
        background: var(--surface);
        cursor: not-allowed;
      }
      .form-error {
        background: var(--red-bg);
        color: var(--red);
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.4;
      }
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
        text-align: center;
      }
      .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(29,127,232,0.4);
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .form-submit {
        margin-top: 8px;
      }
      .form-foot {
        text-align: center;
        margin-top: 8px;
      }
      .link {
        color: var(--blue);
        font-weight: 600;
        text-decoration: none;
        font-size: 14px;
      }
      .link:hover {
        text-decoration: underline;
      }
    `}</style>
  );
}
