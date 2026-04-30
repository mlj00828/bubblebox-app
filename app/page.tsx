"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header, Footer } from "@/components/Chrome";
import { SERVICES, formatPrice } from "@/lib/services";
import { isInServiceArea } from "@/lib/service-area";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=800&q=80";

export default function Home() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState("");

  function handleZipSubmit() {
    const z = zip.trim();
    if (z.length !== 5) {
      setZipError("Enter a 5-digit ZIP code");
      return;
    }
    if (!isInServiceArea(z)) {
      setZipError(`We don't serve ${z} yet — email us and we'll let you know when we expand.`);
      return;
    }
    setZipError("");
    router.push(`/book?zip=${z}`);
  }

  return (
    <>
      <Header />

      <main>
        {/* ======= HERO ======= */}
        <section className="relative overflow-hidden">
          {/* Background photo — covers entire hero on desktop */}
          <div className="absolute inset-0 hidden md:block">
            <img
              src={HERO_IMAGE}
              alt=""
              className="h-full w-full object-cover"
              style={{ filter: "brightness(0.35)" }}
            />
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16 md:px-8 md:py-28">
            {/* Left: headline + ZIP widget */}
            <div className="md:text-white">
              <div
                className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-accent-deep)",
                }}
              >
                Atlanta · Serving 147 ZIP codes
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
                Trusted cleaning,
                <br />
                <span style={{ color: "var(--color-accent)" }}>
                  booked in minutes.
                </span>
              </h1>

              <ul className="mt-6 space-y-2 text-base md:text-lg" style={{ color: "var(--color-muted)" }}>
                <li className="flex items-start gap-2 md:text-white/70">
                  <span className="mt-1 text-[var(--color-accent)]">✓</span>
                  Vetted, background-checked professionals
                </li>
                <li className="flex items-start gap-2 md:text-white/70">
                  <span className="mt-1 text-[var(--color-accent)]">✓</span>
                  Transparent pricing — no surprise fees
                </li>
                <li className="flex items-start gap-2 md:text-white/70">
                  <span className="mt-1 text-[var(--color-accent)]">✓</span>
                  Book online, get matched in under 5 minutes
                </li>
              </ul>

              {/* ZIP entry widget */}
              <div className="mt-8">
                <label
                  htmlFor="hero-zip"
                  className="mb-2 block text-sm font-semibold md:text-white"
                >
                  Enter your ZIP code to get started
                </label>
                <div className="flex gap-2">
                  <input
                    id="hero-zip"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    value={zip}
                    onChange={(e) => {
                      setZip(e.target.value.replace(/\D/g, "").slice(0, 5));
                      setZipError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleZipSubmit()}
                    placeholder="30309"
                    className="w-36 rounded-xl px-4 py-3 text-lg font-semibold shadow-sm"
                    style={{
                      background: "white",
                      border: zipError
                        ? "2px solid var(--color-danger)"
                        : "2px solid var(--color-rule)",
                      color: "var(--color-ink)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleZipSubmit}
                    className="rounded-xl px-6 py-3 text-base font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
                    style={{ background: "var(--color-accent)" }}
                  >
                    Book a cleaning
                  </button>
                </div>
                {zipError && (
                  <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-danger)" }}>
                    {zipError}
                  </p>
                )}
              </div>
            </div>

            {/* Right: hero photo for mobile (desktop uses bg image) */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl md:hidden">
              <img
                src={HERO_IMAGE}
                alt="Modern clean home interior"
                className="h-64 w-full object-cover"
              />
            </div>

            {/* Right: trust card overlay on desktop */}
            <div className="hidden md:block">
              <div
                className="rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  color: "var(--color-ink)",
                }}
              >
                <div className="grid grid-cols-2 gap-6 text-center">
                  <TrustStat num="147" label="ZIP codes" />
                  <TrustStat num="6" label="Service types" />
                  <TrustStat num="$99" label="Starting at" />
                  <TrustStat num="100%" label="Vetted pros" />
                </div>
                <div
                  className="mt-6 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
                  style={{
                    background: "var(--color-surface)",
                    color: "var(--color-accent-deep)",
                  }}
                >
                  <ShieldIcon />
                  All pros are background-checked &amp; insured
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======= TRUST BAR (mobile only — desktop has the card) ======= */}
        <section
          className="border-y py-6 md:hidden"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-rule)",
          }}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-4 gap-2 px-4 text-center">
            <TrustStat num="147" label="ZIPs" />
            <TrustStat num="6" label="Services" />
            <TrustStat num="$99" label="From" />
            <TrustStat num="100%" label="Vetted" />
          </div>
        </section>

        {/* ======= SERVICES ======= */}
        <section id="services" className="px-4 py-20 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span
                className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-accent-deep)",
                }}
              >
                Our services
              </span>
              <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
                Honest pricing for every clean.
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--color-muted)" }}>
                No surprise fees. No bait-and-switch quotes. What you see is
                what you pay.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => (
                <Link
                  href={`/book?service=${s.id}`}
                  key={s.id}
                  className="group relative overflow-hidden rounded-2xl no-underline shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: "white",
                    border: "1px solid var(--color-rule)",
                  }}
                >
                  {/* Photo */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={s.imageUrl}
                      alt={s.imageAlt}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {s.popular && (
                      <span
                        className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                        style={{ background: "var(--color-accent)" }}
                      >
                        Most popular
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {s.name}
                    </h3>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {s.longDescription}
                    </p>
                    <div
                      className="mt-4 flex items-center justify-between border-t pt-3"
                      style={{ borderColor: "var(--color-rule)" }}
                    >
                      <span
                        className="text-2xl font-extrabold"
                        style={{ color: "var(--color-accent-deep)" }}
                      >
                        {formatPrice(s.basePriceCents)}
                      </span>
                      <span
                        className="flex items-center gap-1 text-sm font-medium"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Book →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ======= HOW IT WORKS ======= */}
        <section
          id="how"
          className="px-4 py-20 md:px-8"
          style={{ background: "var(--color-ink)", color: "white" }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <span
                className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "rgba(14, 165, 233, 0.15)",
                  color: "var(--color-accent)",
                }}
              >
                How it works
              </span>
              <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
                Three steps to spotless.
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              <StepCard
                num="1"
                title="Tell us about your home"
                body="Pick your service, enter your ZIP code, and choose a date. Get a transparent price upfront — no quote calls, no waiting."
                icon={<CalendarIcon />}
              />
              <StepCard
                num="2"
                title="We match a pro"
                body="We text vetted cleaning pros in your area. The first to claim your job is yours. Usually matched in under 5 minutes."
                icon={<MatchIcon />}
              />
              <StepCard
                num="3"
                title="Sit back, get clean"
                body="Your pro arrives at the scheduled time. Pay through BubbleBox after the job. Leave a review to help your community."
                icon={<SparkleIcon />}
              />
            </div>
          </div>
        </section>

        {/* ======= REVIEWS ======= */}
        <section id="reviews" className="px-4 py-20 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span
                className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-accent-deep)",
                }}
              >
                Reviews
              </span>
              <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
                What Atlanta is saying.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <ReviewCard
                name="Jessica M."
                neighborhood="Midtown · 30309"
                stars={5}
                quote="Booked a deep clean at 9 AM, had a pro at my door by 11. My kitchen has never looked this good. Already scheduled the next one."
              />
              <ReviewCard
                name="David P."
                neighborhood="Buckhead · 30305"
                stars={5}
                quote="I run three Airbnb units. BubbleBox turnovers are faster than my old service and the pricing is completely transparent."
              />
              <ReviewCard
                name="Tanya R."
                neighborhood="Decatur · 30030"
                stars={4}
                quote="Moved into a new apartment and needed a move-in clean ASAP. BubbleBox had someone there the next morning. Very thorough."
              />
            </div>
            <p className="mt-6 text-center text-xs" style={{ color: "var(--color-muted)" }}>
              Launch reviews from early customers. May 2026.
            </p>
          </div>
        </section>

        {/* ======= TRUST BADGES ======= */}
        <section
          className="px-4 py-12 md:px-8"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-center">
            <TrustBadge icon={<ShieldIcon />} label="Background checked" />
            <TrustBadge icon={<LockIcon />} label="SSL secured" />
            <TrustBadge icon={<CreditCardIcon />} label="Stripe payments" />
            <TrustBadge icon={<CheckCircleIcon />} label="Insured pros" />
          </div>
        </section>

        {/* ======= FINAL CTA ======= */}
        <section className="px-4 py-24 text-center md:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold md:text-5xl">
              Ready for a cleaner home?
            </h2>
            <p className="mt-4 text-lg" style={{ color: "var(--color-muted)" }}>
              Book in under two minutes. No login required.
            </p>
            <Link
              href="/book"
              className="mt-8 inline-block rounded-full px-8 py-4 text-lg font-bold text-white no-underline shadow-lg transition-transform hover:-translate-y-0.5"
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

/* ===== Sub-components ===== */

function TrustStat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <span
        className="block text-2xl font-extrabold"
        style={{ color: "var(--color-accent-deep)" }}
      >
        {num}
      </span>
      <span className="text-xs" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function StepCard({
  num,
  title,
  body,
  icon,
}: {
  num: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-8"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{
            background: "var(--color-accent)",
            color: "white",
          }}
        >
          {num}
        </span>
        <div style={{ color: "var(--color-accent)" }}>{icon}</div>
      </div>
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        {body}
      </p>
    </div>
  );
}

function ReviewCard({
  name,
  neighborhood,
  stars,
  quote,
}: {
  name: string;
  neighborhood: string;
  stars: number;
  quote: string;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "white",
        border: "1px solid var(--color-rule)",
      }}
    >
      <div className="flex items-center gap-1 text-base" style={{ color: "#facc15" }}>
        {Array.from({ length: stars }).map((_, i) => (
          <span key={i}>★</span>
        ))}
        {Array.from({ length: 5 - stars }).map((_, i) => (
          <span key={i} style={{ color: "var(--color-rule)" }}>
            ★
          </span>
        ))}
      </div>
      <p
        className="mt-3 text-sm leading-relaxed"
        style={{ color: "var(--color-ink)" }}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-4">
        <div className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          {name}
        </div>
        <div className="text-xs" style={{ color: "var(--color-muted)" }}>
          {neighborhood}
        </div>
      </div>
    </div>
  );
}

function TrustBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "var(--color-accent-deep)" }}>{icon}</span>
      <span
        className="text-sm font-medium"
        style={{ color: "var(--color-ink)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ===== SVG Icons ===== */

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
