import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { SERVICES, formatPrice } from "@/lib/services";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
            <div>
              <span
                className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-accent-deep)",
                }}
              >
                Atlanta · Founded 2026
              </span>
              <h1
                className="mt-6 text-5xl leading-[1.05] tracking-tight md:text-7xl"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  color: "var(--color-ink)",
                }}
              >
                A cleaner home,{" "}
                <em
                  style={{
                    fontStyle: "italic",
                    color: "var(--color-accent-deep)",
                  }}
                >
                  booked in seconds.
                </em>
              </h1>
              <p
                className="mt-6 max-w-lg text-lg"
                style={{ color: "var(--color-muted)" }}
              >
                BubbleBox connects Atlanta homeowners and small businesses with
                carefully vetted cleaning professionals. No phone tag. No quote
                forms. Just transparent pricing and a pro at your door.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/book"
                  className="rounded-full px-6 py-3 font-medium text-white no-underline transition-transform hover:-translate-y-0.5"
                  style={{ background: "var(--color-accent)" }}
                >
                  Book a cleaning
                </Link>
                <Link
                  href="#services"
                  className="rounded-full border-2 px-6 py-3 font-medium no-underline"
                  style={{
                    borderColor: "var(--color-ink)",
                    color: "var(--color-ink)",
                  }}
                >
                  See services
                </Link>
              </div>
            </div>

            {/* Hero card mock */}
            <div
              className="relative overflow-hidden rounded-2xl p-8"
              style={{ background: "var(--color-ink)", color: "white" }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 180,
                  height: 180,
                  background:
                    "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
                  opacity: 0.3,
                }}
              />
              <div
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--color-accent)" }}
              >
                Live offer · 30309
              </div>
              <h3
                className="mt-6 text-2xl leading-snug"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                "Standard cleaning needed in Midtown for Saturday morning."
              </h3>
              <div
                className="mt-6 flex justify-between border-t pt-4 text-sm"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span>Reply YES to claim</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "white" }}>$99</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section
          className="border-y py-8"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-rule)",
          }}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4 md:px-8">
            <TrustItem num="147" label="ZIP codes covered" />
            <TrustItem num="6" label="Service types" />
            <TrustItem num="$99" label="Standard cleaning" />
            <TrustItem num="100%" label="Vetted pros" />
          </div>
        </section>

        {/* Services */}
        <section id="services" className="px-4 py-20 md:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="What we offer"
              title="Honest pricing for every clean."
              subtitle="No surprise fees. No bait-and-switch quotes. The price you see is the price you pay your pro."
            />

            <div className="grid gap-4 md:grid-cols-3">
              {SERVICES.map((s) => (
                <article
                  key={s.id}
                  className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                  style={{
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-rule)",
                  }}
                >
                  <span className="text-3xl">{s.icon}</span>
                  <h3
                    className="mt-3 text-xl"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                  >
                    {s.name}
                  </h3>
                  <p
                    className="mt-2 min-h-[3rem] text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {s.longDescription}
                  </p>
                  <div
                    className="mt-5 flex items-baseline justify-between border-t pt-4"
                    style={{ borderColor: "var(--color-rule)" }}
                  >
                    <span
                      className="text-3xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 500,
                        color: "var(--color-accent-deep)",
                      }}
                    >
                      {formatPrice(s.basePriceCents)}
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                      {s.durationHint}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="px-4 py-20 md:px-8"
          style={{ background: "var(--color-ink)", color: "white" }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <span
                className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: "rgba(14, 165, 233, 0.15)",
                  color: "var(--color-accent)",
                }}
              >
                How it works
              </span>
              <h2
                className="mt-4 text-4xl leading-tight md:text-5xl"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                Three steps from booked to spotless.
              </h2>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              <Step num="01" title="Book online" body="Pick your service, ZIP code, and preferred date. Get a transparent price upfront. No quote calls." />
              <Step num="02" title="We match a pro" body="We text vetted cleaning pros in your area. The first to claim your job is yours. Usually under 5 minutes." />
              <Step num="03" title="Sit back, get clean" body="Your pro arrives at the scheduled time. Pay through BubbleBox after the job. Leave a review." />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="px-4 py-24 text-center md:px-8"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="mx-auto max-w-3xl">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{
                background: "white",
                color: "var(--color-accent-deep)",
              }}
            >
              Get started
            </span>
            <h2
              className="mt-4 text-4xl leading-tight md:text-6xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              Ready for a cleaner home?
            </h2>
            <p className="mt-4 text-lg" style={{ color: "var(--color-muted)" }}>
              Book in under two minutes. No login required.
            </p>
            <Link
              href="/book"
              className="mt-10 inline-block rounded-full px-8 py-4 text-base font-medium text-white no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--color-accent)" }}
            >
              Book a cleaning
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function TrustItem({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <span
        className="block text-3xl"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          color: "var(--color-accent-deep)",
        }}
      >
        {num}
      </span>
      <span className="mt-1 block text-sm" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-16 max-w-2xl text-center">
      <span
        className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
        style={{
          background: "var(--color-surface)",
          color: "var(--color-accent-deep)",
        }}
      >
        {eyebrow}
      </span>
      <h2
        className="mt-4 text-4xl leading-tight md:text-5xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg" style={{ color: "var(--color-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <span
        className="block text-5xl leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          color: "var(--color-accent)",
        }}
      >
        {num}
      </span>
      <h3
        className="mt-4 text-xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
        {body}
      </p>
    </div>
  );
}
