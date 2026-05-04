"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Header, Footer } from "@/components/Chrome";
import { SERVICES, formatPrice, type ServiceId } from "@/lib/services";
import { isInServiceArea } from "@/lib/service-area";
import {
  createBooking,
  toE164USPhone,
  formatPhoneForDisplay,
  BookingError,
} from "@/lib/api";

type Window = "morning" | "afternoon" | "evening" | "anytime";

interface FormState {
  serviceId: ServiceId | null;
  zip: string;
  date: string;
  window: Window;
  addressLine: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
}

const STEPS = ["Service", "When & where", "Details", "Contact", "Review"] as const;

export default function BookPageWrapper() {
  return (
    <Suspense fallback={<BookPageShell />}>
      <BookPage />
    </Suspense>
  );
}

function BookPageShell() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-surface)]" />
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-[var(--color-surface)]" />
      </main>
      <Footer />
    </>
  );
}

function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    serviceId: null,
    zip: "",
    date: defaultDate(),
    window: "morning",
    addressLine: "",
    notes: "",
    name: "",
    email: "",
    phone: "",
  });

  // Read URL params on mount
  useEffect(() => {
    const urlZip = searchParams.get("zip");
    const urlService = searchParams.get("service");
    const patch: Partial<FormState> = {};

    if (urlZip && /^\d{5}$/.test(urlZip) && isInServiceArea(urlZip)) {
      patch.zip = urlZip;
    }
    if (urlService && SERVICES.some((s) => s.id === urlService)) {
      patch.serviceId = urlService as ServiceId;
    }

    if (Object.keys(patch).length > 0) {
      setForm((f) => ({ ...f, ...patch }));
      // If service was pre-selected from the homepage card, skip step 0
      if (patch.serviceId) {
        setStep(1);
      }
    }
  }, [searchParams]);

  const selectedService = SERVICES.find((s) => s.id === form.serviceId) ?? null;
  const stepValid = validateStep(step, form);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
    setServerError(null);
  }

  async function submit() {
    if (!form.serviceId) return;
    const phoneE164 = toE164USPhone(form.phone);
    if (!phoneE164) {
      setServerError("Please enter a valid US phone number.");
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await createBooking({
        service_id: form.serviceId,
        zip: form.zip.trim(),
        preferred_date: form.date,
        preferred_window: form.window === "anytime" ? "morning" : form.window,
        address_line: form.addressLine.trim(),
        notes: form.notes.trim() || undefined,
        customer: {
          name: form.name.trim(),
          phone: phoneE164,
          email: form.email.trim() || undefined,
        },
      });

      try {
        sessionStorage.setItem(`booking-phone-${res.id}`, phoneE164);
      } catch {
        // sessionStorage might be blocked
      }

      router.push(`/book/confirm/${res.id}`);
    } catch (err) {
      if (err instanceof BookingError) {
        if (err.details && err.details.length > 0) {
          setServerError(
            "Some details look off: " +
              err.details.map((d) => d.message).join(", ")
          );
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError(
          "Couldn't reach the booking server. Check your connection and try again."
        );
      }
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-16">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-accent-deep)" }}
            >
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {STEPS[step]}
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full"
            style={{ background: "var(--color-surface)" }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((step + 1) / STEPS.length) * 100}%`,
                background: "var(--color-accent)",
              }}
            />
          </div>
        </div>

        <h1 className="mb-8 text-3xl font-extrabold md:text-4xl">
          {stepHeading(step)}
        </h1>

        {/* Step body */}
        <div className="space-y-6">
          {step === 0 && (
            <ServiceStep
              value={form.serviceId}
              onChange={(serviceId) => setForm({ ...form, serviceId })}
            />
          )}
          {step === 1 && (
            <WhenWhereStep
              form={form}
              onChange={(patch) => setForm({ ...form, ...patch })}
            />
          )}
          {step === 2 && (
            <DetailsStep
              form={form}
              onChange={(patch) => setForm({ ...form, ...patch })}
            />
          )}
          {step === 3 && (
            <ContactStep
              form={form}
              onChange={(patch) => setForm({ ...form, ...patch })}
            />
          )}
          {step === 4 && selectedService && (
            <ReviewStep form={form} service={selectedService} />
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <div
            className="mt-6 rounded-xl p-4 text-sm font-medium"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "var(--color-danger)",
            }}
            role="alert"
          >
            {serverError}
          </div>
        )}

        {/* Nav */}
        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="rounded-full px-5 py-2.5 font-semibold"
              style={{
                background: "transparent",
                color: "var(--color-ink)",
                border: "1px solid var(--color-rule)",
              }}
              disabled={submitting}
            >
              ← Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!stepValid}
              className="rounded-full px-6 py-3 font-bold text-white transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-accent)" }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!stepValid || submitting}
              className="rounded-full px-6 py-3 font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: "var(--color-accent)" }}
            >
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
          )}
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          By booking you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>,{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>, and{" "}
          <Link href="/sms-terms" className="underline">SMS Terms</Link>. Msg &
          data rates may apply.
        </p>
      </main>

      <Footer />
    </>
  );
}

/* ===== Steps ===== */

function ServiceStep({
  value,
  onChange,
}: {
  value: ServiceId | null;
  onChange: (id: ServiceId) => void;
}) {
  return (
    <div className="grid gap-3">
      {SERVICES.map((s) => {
        const selected = value === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className="relative overflow-hidden rounded-2xl text-left transition-all"
            style={{
              background: selected ? "var(--color-surface)" : "white",
              border: `2px solid ${
                selected ? "var(--color-accent)" : "var(--color-rule)"
              }`,
            }}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Thumbnail */}
              <img
                src={s.imageUrl}
                alt={s.imageAlt}
                className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--color-ink)" }}>
                      {s.name}
                      {s.popular && (
                        <span
                          className="ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                          style={{ background: "var(--color-accent)", verticalAlign: "middle" }}
                        >
                          Popular
                        </span>
                      )}
                    </h3>
                    <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
                      {s.shortDescription} · {s.durationHint}
                    </p>
                  </div>
                  <span
                    className="text-xl font-extrabold"
                    style={{ color: "var(--color-accent-deep)" }}
                  >
                    {formatPrice(s.basePriceCents)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function WhenWhereStep({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  const zipValid = form.zip.length === 0 || isInServiceArea(form.zip);
  const zipInArea = form.zip.length === 5 && isInServiceArea(form.zip);

  return (
    <div className="space-y-6">
      <Field label="ZIP code" hint="We currently serve 147 ZIPs across metro Atlanta">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{5}"
          maxLength={5}
          value={form.zip}
          onChange={(e) =>
            onChange({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })
          }
          placeholder="30309"
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{
            background: "white",
            border: `2px solid ${
              !zipValid ? "var(--color-danger)" : "var(--color-rule)"
            }`,
          }}
        />
        {form.zip.length === 5 && !zipInArea && (
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-danger)" }}>
            Sorry, we don&apos;t serve {form.zip} yet.{" "}
            <a href="mailto:bubbleboxusa@gmail.com" className="underline">
              Email us
            </a>{" "}
            and we&apos;ll let you know when we expand.
          </p>
        )}
        {zipInArea && (
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-success)" }}>
            ✓ We service this area
          </p>
        )}
      </Field>

      <Field label="Preferred date">
        <input
          type="date"
          value={form.date}
          min={defaultDate()}
          onChange={(e) => onChange({ date: e.target.value })}
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{
            background: "white",
            border: "2px solid var(--color-rule)",
          }}
        />
      </Field>

      <Field label="Time of day">
        <div className="grid grid-cols-3 gap-2">
          {(["morning", "afternoon", "evening"] as const).map(
            (w) => {
              const selected = form.window === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => onChange({ window: w })}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition-all"
                  style={{
                    background: selected
                      ? "var(--color-accent)"
                      : "white",
                    color: selected ? "white" : "var(--color-ink)",
                    border: `2px solid ${
                      selected ? "var(--color-accent)" : "var(--color-rule)"
                    }`,
                  }}
                >
                  {w}
                </button>
              );
            }
          )}
        </div>
      </Field>
    </div>
  );
}

function DetailsStep({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-6">
      <Field
        label="Service address"
        hint="Street, city, state — we'll share this only with your assigned pro"
      >
        <input
          type="text"
          value={form.addressLine}
          onChange={(e) => onChange({ addressLine: e.target.value })}
          placeholder="123 Main St, Atlanta, GA"
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{
            background: "white",
            border: "2px solid var(--color-rule)",
          }}
        />
      </Field>

      <Field
        label="Anything we should know?"
        hint="Pets, gate codes, areas to skip, special requests — all optional"
      >
        <textarea
          value={form.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Two cats, code 1234 at the gate..."
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{
            background: "white",
            border: "2px solid var(--color-rule)",
            resize: "vertical",
          }}
        />
      </Field>
    </div>
  );
}

function ContactStep({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-6">
      <Field label="Your name">
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Your full name"
          autoComplete="name"
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{
            background: "white",
            border: "2px solid var(--color-rule)",
          }}
        />
      </Field>

      <Field
        label="Mobile phone"
        hint="We text you booking updates. STOP to opt out anytime."
      >
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="(404) 555-0100"
          autoComplete="tel"
          inputMode="tel"
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{
            background: "white",
            border: "2px solid var(--color-rule)",
          }}
        />
      </Field>

      <Field label="Email (optional)" hint="Where we send your receipt">
        <input
          type="email"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          className="w-full rounded-xl px-4 py-3 text-base"
          style={{
            background: "white",
            border: "2px solid var(--color-rule)",
          }}
        />
      </Field>
    </div>
  );
}

function ReviewStep({
  form,
  service,
}: {
  form: FormState;
  service: { name: string; basePriceCents: number; imageUrl: string };
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "white",
        border: "1px solid var(--color-rule)",
      }}
    >
      <div
        className="flex items-center justify-between p-5"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={service.imageUrl}
            alt=""
            className="h-12 w-16 rounded-lg object-cover"
          />
          <div>
            <div className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>
              {service.name}
            </div>
            <div className="text-xs" style={{ color: "var(--color-muted)" }}>
              Estimated total
            </div>
          </div>
        </div>
        <div
          className="text-3xl font-extrabold"
          style={{ color: "var(--color-accent-deep)" }}
        >
          {formatPrice(service.basePriceCents)}
        </div>
      </div>

      <dl className="divide-y" style={{ borderColor: "var(--color-rule)" }}>
        <Row label="When" value={`${formatDate(form.date)} · ${form.window}`} />
        <Row label="Where" value={form.addressLine} />
        <Row label="ZIP" value={form.zip} />
        {form.notes && <Row label="Notes" value={form.notes} />}
        <Row label="Name" value={form.name} />
        <Row label="Phone" value={formatPhoneForDisplay(form.phone)} />
        {form.email && <Row label="Email" value={form.email} />}
      </dl>
    </div>
  );
}

/* ===== Helpers ===== */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-2 block text-xs" style={{ color: "var(--color-muted)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-5 py-3 text-sm">
      <dt style={{ color: "var(--color-muted)" }}>{label}</dt>
      <dd className="text-right font-medium" style={{ color: "var(--color-ink)" }}>
        {value}
      </dd>
    </div>
  );
}

function stepHeading(step: number): string {
  return [
    "What kind of cleaning?",
    "When and where?",
    "A few details",
    "How do we reach you?",
    "Look good?",
  ][step];
}

function validateStep(step: number, form: FormState): boolean {
  switch (step) {
    case 0:
      return form.serviceId !== null;
    case 1:
      return (
        form.zip.length === 5 &&
        isInServiceArea(form.zip) &&
        form.date.length === 10 &&
        ["morning", "afternoon", "evening", "anytime"].includes(form.window)
      );
    case 2:
      return form.addressLine.trim().length >= 5;
    case 3:
      return form.name.trim().length >= 2 && toE164USPhone(form.phone) !== null;
    case 4:
      return true;
    default:
      return false;
  }
}

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
