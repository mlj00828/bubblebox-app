"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function BookPage() {
  const router = useRouter();
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
        preferred_window: form.window,
        address_line: form.addressLine.trim(),
        notes: form.notes.trim() || undefined,
        customer: {
          name: form.name.trim(),
          phone: phoneE164,
          email: form.email.trim() || undefined,
        },
      });

      // Stash phone for the confirmation page (the backend requires it
      // to look up the booking — protects against ID guessing).
      try {
        sessionStorage.setItem(`booking-phone-${res.id}`, phoneE164);
      } catch {
        // sessionStorage might be blocked; the confirm page handles that
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
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-accent-deep)" }}
            >
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {STEPS[step]}
            </span>
          </div>
          <div
            className="h-1 overflow-hidden rounded-full"
            style={{ background: "var(--color-surface)" }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${((step + 1) / STEPS.length) * 100}%`,
                background: "var(--color-accent)",
              }}
            />
          </div>
        </div>

        <h1
          className="mb-8 text-4xl leading-tight md:text-5xl"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-ink)",
          }}
        >
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
            className="mt-6 rounded-lg p-4 text-sm"
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
              className="rounded-full px-5 py-2.5 font-medium"
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
              className="rounded-full px-6 py-3 font-medium text-white transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-accent)" }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!stepValid || submitting}
              className="rounded-full px-6 py-3 font-medium text-white transition-opacity disabled:opacity-60"
              style={{ background: "var(--color-accent)" }}
            >
              {submitting ? "Booking..." : "Confirm booking"}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--color-muted)" }}>
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
            className="rounded-2xl p-5 text-left transition-all"
            style={{
              background: selected ? "var(--color-surface)" : "var(--color-paper)",
              border: `2px solid ${selected ? "var(--color-accent)" : "var(--color-rule)"}`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <h3
                    className="text-lg"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      color: "var(--color-ink)",
                    }}
                  >
                    {s.name}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    {s.shortDescription}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    color: "var(--color-accent-deep)",
                  }}
                >
                  {formatPrice(s.basePriceCents)}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  {s.durationHint}
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
          onChange={(e) => onChange({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
          placeholder="30309"
          className="w-full rounded-lg px-4 py-3 text-base"
          style={{
            background: "var(--color-paper)",
            border: `1px solid ${
              !zipValid ? "var(--color-danger)" : "var(--color-rule)"
            }`,
          }}
        />
        {form.zip.length === 5 && !zipInArea && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-danger)" }}>
            Sorry, we don't serve {form.zip} yet.{" "}
            <a href="mailto:bubbleboxusa@gmail.com" className="underline">
              Email us
            </a>{" "}
            and we'll let you know when we expand.
          </p>
        )}
        {zipInArea && (
          <p className="mt-2 text-sm" style={{ color: "var(--color-success)" }}>
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
          className="w-full rounded-lg px-4 py-3 text-base"
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-rule)",
          }}
        />
      </Field>

      <Field label="Time of day">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(["morning", "afternoon", "evening", "anytime"] as const).map((w) => {
            const selected = form.window === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => onChange({ window: w })}
                className="rounded-lg px-3 py-2.5 text-sm font-medium capitalize transition-all"
                style={{
                  background: selected ? "var(--color-accent)" : "var(--color-paper)",
                  color: selected ? "white" : "var(--color-ink)",
                  border: `1px solid ${
                    selected ? "var(--color-accent)" : "var(--color-rule)"
                  }`,
                }}
              >
                {w}
              </button>
            );
          })}
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
          className="w-full rounded-lg px-4 py-3 text-base"
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-rule)",
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
          className="w-full rounded-lg px-4 py-3 text-base"
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-rule)",
            resize: "vertical",
            fontFamily: "inherit",
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
          placeholder="Morgan Jefferson"
          autoComplete="name"
          className="w-full rounded-lg px-4 py-3 text-base"
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-rule)",
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
          className="w-full rounded-lg px-4 py-3 text-base"
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-rule)",
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
          className="w-full rounded-lg px-4 py-3 text-base"
          style={{
            background: "var(--color-paper)",
            border: "1px solid var(--color-rule)",
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
  service: { name: string; icon: string; basePriceCents: number };
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--color-paper)",
        border: "1px solid var(--color-rule)",
      }}
    >
      <div
        className="flex items-center justify-between p-5"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{service.icon}</span>
          <div>
            <div
              className="text-lg"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                color: "var(--color-ink)",
              }}
            >
              {service.name}
            </div>
            <div className="text-xs" style={{ color: "var(--color-muted)" }}>
              Estimated total
            </div>
          </div>
        </div>
        <div
          className="text-3xl"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-accent-deep)",
          }}
        >
          {formatPrice(service.basePriceCents)}
        </div>
      </div>

      <dl className="divide-y" style={{ borderColor: "var(--color-rule)" }}>
        <Row label="When" value={`${formatDate(form.date)} · ${form.window}`} />
        <Row label="Where" value={`${form.addressLine}`} />
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
      <span
        className="mb-2 block text-sm font-medium"
        style={{ color: "var(--color-ink)" }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span
          className="mt-2 block text-xs"
          style={{ color: "var(--color-muted)" }}
        >
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
      <dd className="text-right" style={{ color: "var(--color-ink)" }}>
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
      return (
        form.name.trim().length >= 2 && toE164USPhone(form.phone) !== null
      );
    case 4:
      return true;
    default:
      return false;
  }
}

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1); // tomorrow
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
