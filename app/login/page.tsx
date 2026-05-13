"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Role = "customer" | "pro";
type Mode = "signin" | "signup";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams?.get("role") as Role) || "customer";

  const [role, setRole] = useState<Role>(initialRole);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (!firstName.trim() || !lastName.trim()) {
          setError("Please enter your name.");
          setSubmitting(false);
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters.");
          setSubmitting(false);
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              role: "customer",
            },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (signUpError) throw signUpError;

        // If email confirmation is required, user.session will be null
        if (data.session) {
          router.push("/account");
        } else {
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        router.push("/account");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      if (oauthError) throw oauthError;
      // OAuth redirects the browser, no further action needed here
    } catch (err: any) {
      setError(err?.message || "Couldn't start Google sign-in.");
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email above first, then click Forgot password.");
      return;
    }
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Couldn't send reset email.");
    }
  }

  return (
    <div className="page">
      {/* Top bar */}
      <div className="topbar">
        <Link href="/" className="topbar-logo">
          <div className="logo-text">
            <div className="topbar-name">BubbleBox ATL</div>
            <div className="topbar-sub">Atlanta's #1 Cleaning</div>
          </div>
        </Link>
      </div>

      <div className="shell">
        <div className="card">
          {/* Role tabs */}
          <div className="role-tabs">
            <div
              className={`role-tab ${role === "customer" ? "active" : ""}`}
              onClick={() => { setRole("customer"); setError(null); setInfo(null); }}
            >
              <div className="icon">👤</div>
              <div>I'm a Customer</div>
            </div>
            <div
              className={`role-tab ${role === "pro" ? "active" : ""}`}
              onClick={() => { setRole("pro"); setError(null); setInfo(null); }}
            >
              <div className="icon">🧹</div>
              <div>I'm a Cleaner</div>
            </div>
          </div>

          <div className="form-body">
            {role === "customer" ? (
              <>
                <div>
                  <h1 className="form-title">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
                  <div className="form-sub">
                    {mode === "signin"
                      ? "Sign in to manage your bookings"
                      : "Sign up to save your bookings and reschedule easily"}
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {mode === "signup" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="field">
                        <label className="field-label">First Name</label>
                        <div className="field-wrap">
                          <input
                            type="text"
                            className="f-input no-icon"
                            placeholder="Jane"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            autoComplete="given-name"
                            required
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label className="field-label">Last Name</label>
                        <div className="field-wrap">
                          <input
                            type="text"
                            className="f-input no-icon"
                            placeholder="Smith"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            autoComplete="family-name"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="field">
                    <label className="field-label">Email</label>
                    <div className="field-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M2 8l10 7 10-7" />
                      </svg>
                      <input
                        type="email"
                        className="f-input"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete={mode === "signin" ? "username" : "email"}
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">Password</label>
                    <div className="field-wrap">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                      <input
                        type={showPass ? "text" : "password"}
                        className="f-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        required
                        minLength={mode === "signup" ? 8 : undefined}
                      />
                      <button
                        type="button"
                        className="pass-toggle"
                        onClick={() => setShowPass((s) => !s)}
                      >
                        {showPass ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  {mode === "signin" && (
                    <div className="form-options">
                      <span />
                      <button type="button" className="link" onClick={handleForgotPassword}>
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {error && <div className="error-banner">{error}</div>}
                  {info && <div className="info-banner">{info}</div>}

                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                  </button>
                </form>

                <div className="divider">or</div>

                <button className="btn-social" onClick={handleGoogleSignIn} disabled={submitting} type="button">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <div className="signup-cta">
                  {mode === "signin" ? (
                    <>
                      Don't have an account?{" "}
                      <button type="button" className="cta-link" onClick={() => { setMode("signup"); setError(null); setInfo(null); }}>
                        Create one →
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button type="button" className="cta-link" onClick={() => { setMode("signin"); setError(null); setInfo(null); }}>
                        Sign in →
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Pro tab — "coming soon"
              <>
                <div>
                  <h1 className="form-title">Cleaner sign-in</h1>
                  <div className="form-sub">Pro accounts are coming soon.</div>
                </div>

                <div className="coming-soon-card">
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🧹</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--blue-dark, #0A2FA8)", marginBottom: 8 }}>
                    Pro accounts are launching soon
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-mid, #3B5280)", marginBottom: 16, lineHeight: 1.5 }}>
                    We're building the pro portal where you'll manage jobs, see earnings, and accept bookings. In the meantime, apply to be a BubbleBox cleaner and we'll be in touch.
                  </div>
                </div>

                <Link href="/join" style={{ textDecoration: "none" }}>
                  <button type="button" className="btn-primary" style={{ width: "100%" }}>
                    🧹 Apply to be a BubbleBox cleaner →
                  </button>
                </Link>

                <div className="signup-cta" style={{ marginTop: 8 }}>
                  Already applied?{" "}
                  <a href="mailto:bubbleboxusa@gmail.com" className="cta-link">
                    Email us for status →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="footer-mini">
        <div style={{ marginBottom: 8 }}>© 2026 BubbleBox ATL. All rights reserved.</div>
        <div>
          <Link href="/">Home</Link> · <Link href="/book">Book a Cleaning</Link> · <Link href="/join">Join Our Team</Link>
        </div>
      </div>

      <style jsx>{`
        :global(:root) {
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
          --radius: 16px;
          --radius-sm: 10px;
        }
        .page {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          color: var(--text);
          background: linear-gradient(135deg, #EBF5FF 0%, #F5FBFF 50%, #D6EEFF 100%);
          display: flex;
          flex-direction: column;
        }
        .topbar { padding: 20px 24px; display: flex; align-items: center; }
        .topbar-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-text { display: flex; flex-direction: column; }
        .topbar-name { font-size: 20px; font-weight: 800; color: var(--blue-dark); letter-spacing: -0.3px; }
        .topbar-sub { font-size: 10px; font-weight: 600; color: var(--text-light); letter-spacing: 0.5px; text-transform: uppercase; }

        .shell { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px 16px 60px; }
        .card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(29, 127, 232, 0.18);
          max-width: 440px;
          width: 100%;
          overflow: hidden;
        }

        .role-tabs { display: grid; grid-template-columns: 1fr 1fr; background: var(--blue-bg); }
        .role-tab {
          padding: 18px 16px;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-mid);
          border-bottom: 3px solid transparent;
          transition: all 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .role-tab .icon { font-size: 22px; }
        .role-tab.active {
          background: white;
          color: var(--blue);
          border-bottom-color: var(--blue);
        }

        .form-body { padding: 36px 32px; display: flex; flex-direction: column; gap: 18px; }
        @media (max-width: 480px) { .form-body { padding: 28px 22px; } }

        .form-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 30px;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.15;
        }
        .form-sub { font-size: 14px; color: var(--text-mid); margin-top: 6px; }

        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 13px; font-weight: 600; color: var(--text-mid); }
        .field-wrap { position: relative; }
        .field-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }
        .f-input {
          width: 100%;
          padding: 14px 14px 14px 42px;
          border: 2px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 15px;
          color: var(--text);
          background: white;
          transition: border-color 0.15s;
          outline: none;
          -webkit-appearance: none;
        }
        .f-input.no-icon { padding-left: 14px; }
        .f-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(29, 127, 232, 0.12); }
        .f-input::placeholder { color: var(--text-light); }

        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 6px;
          font-size: 12px;
          font-weight: 700;
          font-family: inherit;
        }
        .pass-toggle:hover { color: var(--blue); }

        .form-options { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .link, .cta-link {
          color: var(--blue);
          font-weight: 600;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
        }
        .link:hover, .cta-link:hover { text-decoration: underline; }
        .cta-link { font-weight: 700; }

        .btn-primary {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, var(--blue), var(--blue-mid));
          color: white;
          font-size: 16px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(29, 127, 232, 0.35);
          transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(29, 127, 232, 0.45);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: wait; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-light);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .btn-social {
          width: 100%;
          padding: 13px;
          border-radius: 50px;
          border: 2px solid var(--border);
          background: white;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .btn-social:hover:not(:disabled) { border-color: var(--blue); background: var(--blue-bg); }
        .btn-social:disabled { opacity: 0.6; cursor: wait; }

        .signup-cta {
          text-align: center;
          font-size: 14px;
          color: var(--text-mid);
          padding-top: 6px;
        }

        .error-banner {
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          font-size: 13px;
          color: #b91c1c;
        }
        .info-banner {
          padding: 10px 14px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          font-size: 13px;
          color: #15803d;
        }

        .coming-soon-card {
          padding: 24px;
          background: var(--blue-bg);
          border: 1.5px solid var(--blue-pale);
          border-radius: 14px;
          text-align: center;
        }

        .footer-mini {
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: var(--text-light);
        }
        .footer-mini :global(a) {
          color: var(--text-mid);
          text-decoration: none;
          margin: 0 8px;
        }
        .footer-mini :global(a:hover) { color: var(--blue); }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading…</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
