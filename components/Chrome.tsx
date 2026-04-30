import Link from "next/link";

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        background: "rgba(240, 251, 255, 0.85)",
        borderBottom: "1px solid var(--color-rule)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Logo />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            BubbleBox
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#services"
            className="text-sm font-medium no-underline"
            style={{ color: "var(--color-ink)" }}
          >
            Services
          </Link>
          <Link
            href="/#how"
            className="text-sm font-medium no-underline"
            style={{ color: "var(--color-ink)" }}
          >
            How it works
          </Link>
          <Link
            href="/#reviews"
            className="text-sm font-medium no-underline"
            style={{ color: "var(--color-ink)" }}
          >
            Reviews
          </Link>
          <Link
            href="/book"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white no-underline transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--color-accent)" }}
          >
            Book now
          </Link>
        </nav>

        {/* Mobile: just the CTA */}
        <Link
          href="/book"
          className="rounded-full px-4 py-2 text-sm font-semibold text-white no-underline md:hidden"
          style={{ background: "var(--color-accent)" }}
        >
          Book
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer
      className="mt-20"
      style={{
        background: "var(--color-ink)",
        color: "rgba(255, 255, 255, 0.7)",
        padding: "3rem 0 2rem",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <Logo light />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                BubbleBox
              </span>
            </Link>
            <p
              className="mt-3 max-w-xs text-sm"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Trusted cleaning, booked in minutes. Connecting Atlanta with
              carefully vetted cleaning professionals since 2026.
            </p>
          </div>

          <div>
            <h4
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "white" }}
            >
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#services"
                  className="no-underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/#how"
                  className="no-underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="no-underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Book a cleaning
                </Link>
              </li>
              <li>
                <a
                  href="mailto:bubbleboxusa@gmail.com"
                  className="no-underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "white" }}
            >
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/sms-terms"
                  className="no-underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  SMS Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="no-underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="no-underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 flex flex-col gap-2 border-t pt-6 text-xs md:flex-row md:justify-between"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>© 2026 BubbleBox. All rights reserved.</span>
          <span>
            Atlanta, GA ·{" "}
            <a
              href="tel:+16788204881"
              className="no-underline"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              +1 (678) 820-4881
            </a>{" "}
            ·{" "}
            <a
              href="mailto:bubbleboxusa@gmail.com"
              className="no-underline"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              bubbleboxusa@gmail.com
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "var(--color-accent)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: "50%",
          top: 7,
          left: 9,
          background: light ? "var(--color-ink)" : "var(--color-paper)",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: 5,
          height: 5,
          borderRadius: "50%",
          top: 16,
          left: 18,
          background: light ? "var(--color-ink)" : "var(--color-paper)",
        }}
      />
    </span>
  );
}
