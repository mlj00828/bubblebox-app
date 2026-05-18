"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// This page is the single landing spot for ALL auth flows:
//   - Magic link sign-in
//   - Google OAuth callback
//   - Supabase invite links
//   - Password recovery
//
// It waits for Supabase to establish a session from the URL hash token,
// then routes the user based on their role:
//   role === "pro"      -> /pro
//   role === "customer" -> /account
//   anything else       -> /account (default)
//
// If no session is established (expired/invalid link), it shows an error
// with a link back to /login.

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      // Give Supabase a moment to process the URL hash token.
      // detectSessionInUrl: true in lib/supabase.ts auto-parses #access_token.
      // We poll briefly because the parse is async and may not be done on first read.
      let session = null;
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          session = data.session;
          break;
        }
        await new Promise((r) => setTimeout(r, 250));
      }

      if (cancelled) return;

      if (!session) {
        setErrorMsg(
          "We couldn't sign you in. The link may have expired or already been used."
        );
        setStatus("error");
        return;
      }

      // Clear the token hash from the URL so a refresh doesn't reprocess it
      if (typeof window !== "undefined" && window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      // Route based on role stored in user_metadata
      const role = session.user?.user_metadata?.role;
      if (role === "pro") {
        router.replace("/pro");
      } else {
        // customers and anyone else go to /account
        router.replace("/account");
      }
    }

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="cb-page">
      <div className="cb-card">
        {status === "working" ? (
          <>
            <div className="cb-spinner" />
            <div className="cb-title">Signing you in…</div>
            <div className="cb-sub">Just a moment.</div>
          </>
        ) : (
          <>
            <div className="cb-icon">⚠️</div>
            <div className="cb-title">Sign-in link problem</div>
            <div className="cb-sub">{errorMsg}</div>
            <a href="/login" className="cb-btn">Back to sign in</a>
          </>
        )}
      </div>

      <style jsx global>{`
        :root {
          --blue: #1D7FE8;
          --blue-mid: #2563EB;
          --blue-dark: #0A2FA8;
          --bg: #F5FBFF;
          --text: #0D1B3E;
          --text-mid: #3B5280;
          --border: #C8E0F8;
        }
        .cb-page {
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .cb-card {
          background: white;
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 48px 36px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(29,127,232,0.08);
          max-width: 400px;
        }
        .cb-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top-color: var(--blue);
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: cb-spin 0.8s linear infinite;
        }
        @keyframes cb-spin {
          to { transform: rotate(360deg); }
        }
        .cb-icon { font-size: 44px; margin-bottom: 14px; }
        .cb-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 22px;
          color: var(--text);
          margin-bottom: 8px;
        }
        .cb-sub {
          font-size: 14px;
          color: var(--text-mid);
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .cb-btn {
          display: inline-block;
          background: linear-gradient(135deg, var(--blue), var(--blue-mid));
          color: white;
          border-radius: 50px;
          padding: 12px 26px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
