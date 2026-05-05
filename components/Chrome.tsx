"use client";
import { useState } from "react";
import Link from "next/link";

const NAV_LINKS: [string, string][] = [
  ["/#services", "Services"],
  ["/#included", "What's Included"],
  ["/#how", "How It Works"],
  ["/#pricing", "Pricing"],
  ["/#reviews", "Reviews"],
  ["/#faq", "FAQ"],
  ["/join", "Join Our Team"],
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-rule)",
        boxShadow: "0 1px 12px rgba(29,127,232,0.07)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 68,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <img src="/icons/icon-192.png" alt="BubbleBox ATL" style={{ height: 46, width: "auto" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "var(--color-accent-deep)", letterSpacing: "-0.3px", lineHeight: 1 }}>
              BubbleBox ATL
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Atlanta's #1 Cleaning
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
          {NAV_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-ink-mid)",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: 8,
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-accent)";
                (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-ink-mid)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book"
            style={{
              background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
              color: "white",
              borderRadius: 50,
              padding: "10px 22px",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 3px 12px rgba(29,127,232,0.30)",
              marginLeft: 8,
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            Book Now →
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            marginLeft: "auto",
            color: "var(--color-ink)",
          }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1={3} y1={6} x2={21} y2={6} />
            <line x1={3} y1={12} x2={21} y2={12} />
            <line x1={3} y1={18} x2={21} y2={18} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "white", borderTop: "1px solid var(--color-rule)", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 16, fontWeight: 600, color: "var(--color-ink-mid)", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid var(--color-surface)" }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            style={{
              textAlign: "center",
              marginTop: 8,
              padding: 14,
              borderRadius: 50,
              background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Book Now →
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

export function Footer() {
  const FOOTER_SERVICES = [
    "Standard Cleaning",
    "Deep Cleaning",
    "Airbnb Turnover",
    "Move In / Out",
    "Post-Construction",
    "Office Cleaning",
  ];

  const FOOTER_COMPANY: [string, string][] = [
    ["/#how", "How It Works"],
    ["/#pricing", "Pricing"],
    ["/#reviews", "About Us"],
    ["/#faq", "FAQ"],
  ["/join", "Join Our Team"],
    ["/join", "Join as a Pro"],
  ];

  return (
    <footer style={{ background: "var(--color-ink)", color: "rgba(255,255,255,0.8)", padding: "56px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/icons/icon-192.png" alt="BubbleBox ATL" style={{ height: 44, width: "auto" }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>BubbleBox ATL</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 260, color: "rgba(255,255,255,0.65)" }}>
              Atlanta's most affordable professional cleaning service. Serving the metro area since 2026.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                ["instagram", "📷"],
                ["youtube", "▶"],
                ["facebook", "f"],
                ["x", "𝕏"],
              ].map(([s, glyph]) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    fontSize: 16,
                    transition: "background 0.15s",
                  }}
                >
                  {glyph}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 16, letterSpacing: "0.3px" }}>Services</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {FOOTER_SERVICES.map((name) => (
                <li key={name}>
                  <Link href="/book" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 16 }}>Company</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {FOOTER_COMPANY.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 16 }}>Contact</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <a href="tel:+16788204881" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
                  📞 (678) 820-4881
                </a>
              </li>
              <li>
                <a href="mailto:hello@bubbleboxatl.com" style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
                  ✉️ hello@bubbleboxatl.com
                </a>
              </li>
              <li>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>📍 Atlanta, GA</span>
              </li>
              <li>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>Mon–Sun 8am–8pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span>© 2026 BubbleBox ATL. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

export function BubbleLogo({ light = false, size = 40 }: { light?: boolean; size?: number }) {
  return (
    <img
      src="/icons/icon-192.png"
      alt="BubbleBox ATL"
      style={{ height: size, width: size, objectFit: "contain", flexShrink: 0 }}
    />
  );
}
