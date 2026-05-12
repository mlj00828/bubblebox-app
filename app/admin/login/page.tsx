"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setAdminToken, fetchStats, AdminApiError } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = token.trim();
    if (t.length < 20) {
      setError("Enter a valid admin token (at least 20 characters).");
      return;
    }
    setSubmitting(true);
    setAdminToken(t);
    try {
      await fetchStats(); // ping to verify token
      router.replace("/admin");
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        setError("Token rejected. Check the value and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to verify token.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <Image src="/logo.png" alt="BubbleBox" width={72} height={72} />
          <div className="admin-login-logo-text">BubbleBox ATL</div>
          <div className="admin-login-logo-sub">ADMIN PANEL</div>
        </div>
        <h1 className="admin-login-title">Admin Sign In</h1>
        <p className="admin-login-sub">Enter your admin bearer token to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="f-label" htmlFor="admin-token">Admin Token</label>
            <input
              id="admin-token"
              type="password"
              className="f-input admin-mono"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="93b3d626…"
              autoComplete="off"
              autoFocus
            />
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Verifying…" : "Sign In"}
          </button>
        </form>

        <div className="admin-login-hint">
          Auth uses <code>x-admin-token</code> header against<br />
          <code>api.homeproatl.xyz</code>. Token is stored locally only.
        </div>
      </div>
    </div>
  );
}
