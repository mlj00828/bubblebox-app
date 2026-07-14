"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminToken, clearAdminToken } from "@/lib/admin-api";
import "./admin.css";

const NAV = [
  { href: "/admin", label: "Dashboard", pane: "dashboard" },
  { href: "/admin/bookings", label: "Bookings", pane: "bookings" },
  { href: "/admin/payments", label: "Payments", pane: "payments" },
  { href: "/admin/applications", label: "Applications", pane: "applications" },
  { href: "/admin/customers", label: "Customers", pane: "customers" },
  { href: "/admin/pros", label: "Pros", pane: "pros" },
] as const;

function Icon({ name }: { name: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };
  if (name === "dashboard")
    return (
      <svg {...props}>
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    );
  if (name === "bookings")
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  if (name === "payments")
    return (
      <svg {...props}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    );
  if (name === "applications")
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    );
  if (name === "customers")
    return (
      <svg {...props}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  if (name === "pros")
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    );
  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  // /admin/login is public — bypass auth check
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) {
      setAuthed(true);
      return;
    }
    const t = getAdminToken();
    if (!t) {
      router.replace("/admin/login");
      return;
    }
    setAuthed(true);
  }, [isLogin, router]);

  function handleSignout() {
    clearAdminToken();
    router.replace("/admin/login");
  }

  if (authed === null) {
    return (
      <div className="admin-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-light)", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (isLogin) {
    return <div className="admin-root">{children}</div>;
  }

  return (
    <div className="admin-root">
      <div className="admin-app">
        <aside className="admin-sidebar">
          <Link href="/" className="side-logo">
            <Image src="/logo.png" alt="BubbleBox" width={42} height={42} />
            <div>
              <div className="side-logo-name">BubbleBox ATL</div>
              <span className="side-logo-tag">ADMIN</span>
            </div>
          </Link>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`side-link ${active ? "active" : ""}`}
              >
                <Icon name={item.pane} />
                {item.label}
              </Link>
            );
          })}
          <div className="side-footer">
            <div className="side-status">
              <span className="dot" /> API online · api.homeproatl.xyz
            </div>
            <div className="side-status" style={{ color: "var(--orange-dark)" }}>
              <span className="dot" style={{ background: (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").startsWith("pk_live") ? "var(--green)" : "var(--orange)" }} />{" "}
              Stripe: {(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").startsWith("pk_live") ? "LIVE" : "TEST mode"}
            </div>
            <button onClick={handleSignout} className="signout-btn" style={{ width: "100%", textAlign: "left", marginTop: 8 }}>
              Sign out
            </button>
          </div>
        </aside>

        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
