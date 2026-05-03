"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { isInServiceArea } from "@/lib/service-area";
import { toE164USPhone, formatPhoneForDisplay } from "@/lib/api";

const SERVICES_OFFERED = [
  { id: "standard-cleaning", label: "Standard Cleaning" },
  { id: "deep-cleaning", label: "Deep Cleaning" },
  { id: "airbnb-turnover", label: "Airbnb Turnover" },
  { id: "move-in-out", label: "Move In / Out" },
];

const STEPS = ["About you", "Your service", "Agreements", "Submit"] as const;

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  zipsRaw: string;
  services: string[];
  hasInsurance: boolean;
  hasTransportation: boolean;
  yearsExperience: string;
  agreeContractor: boolean;
  agreeAntiCircumvent: boolean;
  agreePlatformTerms: boolean;
  agreeBackgroundCheck: boolean;
  agreeBackgroundDocsLater: boolean;
  agreeStripeOnboardLater: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    zipsRaw: "",
    services: [],
    hasInsurance: false,
    hasTransportation: false,
    yearsExperience: "",
    agreeContractor: false,
    agreeAntiCircumvent: false,
    agreePlatformTerms: false,
    agreeBackgroundCheck: false,
    agreeBackgroundDocsLater: false,
    agreeStripeOnboardLater: false,
  });

  const stepValid = validateStep(step, form);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
    setServerError(null);
  }

  function update(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function toggleService(id: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(id)
        ? f.services.filter((s) => s !== id)
        : [...f.services, id],
    }));
  }

  async function submit() {
    setSubmitting(true);
    setServerError(null);

    const phoneE164 = toE164USPhone(form.phone);
    if (!phoneE164) {
      setServerError("Please enter a valid US phone number.");
      setSubmitting(false);
      return;
    }

    const zips = form.zipsRaw
      .split(/[,\s]+/)
      .map((z) => z.trim())
      .filter((z) => z.length === 5)
      .filter((z, i, arr) => arr.indexOf(z) === i);

    try {
      const res = await fetch(`${API_BASE}/api/pros/applications/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: phoneE164,
          email: form.email.trim(),
          service_zips: zips,
          services: form.services,
          has_insurance: form.hasInsurance,
          has_transportation: form.hasTransportation,
          years_experience: form.yearsExperience,
          agreed_at: new Date().toISOString(),
          agreements: {
            independent_contractor: form.agreeContractor,
            anti_circumvention: form.agreeAntiCircumvent,
            platform_terms: form.agreePlatformTerms,
            background_check_consent: form.agreeBackgroundCheck,
            will_provide_documents: form.agreeBackgroundDocsLater,
            will_complete_stripe_onboarding: form.agreeStripeOnboardLater,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          body?.error?.message ??
          "We couldn't submit your application. Try again in a moment.";
        setServerError(msg);
        setSubmitting(false);
        return;
      }

      router.push("/join/thanks");
    } catch {
      setServerError(
        "Couldn't reach the server. Check your connection and try again."
      );
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

        <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">
          {stepHeading(step)}
        </h1>
        <p className="mb-8 text-base" style={{ color: "var(--color-muted)" }}>
          {stepSubhead(step)}
        </p>

        {/* Steps */}
        <div className="space-y-6">
          {step === 0 && <AboutStep form={form} onChange={update} />}
          {step === 1 && (
            <ServiceStep
              form={form}
              onChange={update}
              toggleService={toggleService}
            />
          )}
          {step === 2 && <AgreementsStep form={form} onChange={update} />}
          {step === 3 && <ReviewStep form={form} />}
        </div>

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
              disabled={submitting}
              className="rounded-full px-5 py-2.5 font-semibold"
              style={{
                background: "transparent",
                color: "var(--color-ink)",
                border: "1px solid var(--color-rule)",
              }}
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
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          )}
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          We review every application within 24-48 hours. Questions?{" "}
          <a href="mailto:bubbleboxusa@gmail.com" className="underline">
            bubbleboxusa@gmail.com
          </a>
        </p>
      </main>

      <Footer />
    </>
  );
}

/* =================== Steps =================== */

function AboutStep({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (p: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            autoComplete="given-name"
            className="form-input"
          />
        </Field>
        <Field label="Last name">
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            autoComplete="family-name"
            className="form-input"
          />
        </Field>
      </div>

      <Field
        label="Mobile phone"
        hint="We text you job offers. Reply YES to claim."
      >
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="(404) 555-0100"
          autoComplete="tel"
          inputMode="tel"
          className="form-input"
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          className="form-input"
        />
      </Field>

      <Field
        label="Years of cleaning experience"
        hint="Approximate is fine"
      >
        <select
          value={form.yearsExperience}
          onChange={(e) => onChange({ yearsExperience: e.target.value })}
          className="form-input"
        >
          <option value="">Select...</option>
          <option value="<1">Less than 1 year</option>
          <option value="1-2">1–2 years</option>
          <option value="3-5">3–5 years</option>
          <option value="6-10">6–10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </Field>

      <style>{formInputCSS}</style>
    </div>
  );
}

function ServiceStep({
  form,
  onChange,
  toggleService,
}: {
  form: FormState;
  onChange: (p: Partial<FormState>) => void;
  toggleService: (id: string) => void;
}) {
  const zipList = form.zipsRaw
    .split(/[,\s]+/)
    .map((z) => z.trim())
    .filter((z) => z.length === 5);
  const validZipCount = zipList.filter(isInServiceArea).length;
  const invalidZips = zipList.filter((z) => !isInServiceArea(z));

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          Which services can you offer?
        </p>
        <div className="grid gap-2">
          {SERVICES_OFFERED.map((s) => {
            const selected = form.services.includes(s.id);
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleService(s.id)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all"
                style={{
                  background: selected
                    ? "var(--color-surface)"
                    : "white",
                  border: `2px solid ${
                    selected ? "var(--color-accent)" : "var(--color-rule)"
                  }`,
                }}
              >
                <span className="font-medium" style={{ color: "var(--color-ink)" }}>
                  {s.label}
                </span>
                {selected && (
                  <span style={{ color: "var(--color-accent)" }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Field
        label="ZIP codes you'll cover"
        hint="Enter ZIPs separated by commas or spaces (e.g. 30309, 30312, 30327)"
      >
        <textarea
          value={form.zipsRaw}
          onChange={(e) => onChange({ zipsRaw: e.target.value })}
          placeholder="30309, 30312, 30327"
          rows={3}
          className="form-input"
          style={{ resize: "vertical" }}
        />
        {validZipCount > 0 && (
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: "var(--color-success)" }}
          >
            ✓ {validZipCount} ZIP{validZipCount === 1 ? "" : "s"} we serve
          </p>
        )}
        {invalidZips.length > 0 && (
          <p className="mt-1 text-sm" style={{ color: "var(--color-danger)" }}>
            We don&apos;t serve: {invalidZips.join(", ")}
          </p>
        )}
      </Field>

      <Checkbox
        checked={form.hasTransportation}
        onChange={(v) => onChange({ hasTransportation: v })}
        label="I have reliable transportation to client locations"
      />

      <Checkbox
        checked={form.hasInsurance}
        onChange={(v) => onChange({ hasInsurance: v })}
        label="I carry general liability insurance (or am willing to obtain)"
      />

      <style>{formInputCSS}</style>
    </div>
  );
}

function AgreementsStep({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (p: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-xl p-4 text-sm"
        style={{
          background: "var(--color-surface)",
          color: "var(--color-ink-soft)",
        }}
      >
        <strong className="block mb-1">Before you continue:</strong>
        Please read each agreement carefully. These are legally binding once you
        check the box and submit.
      </div>

      <AgreementCheck
        checked={form.agreeContractor}
        onChange={(v) => onChange({ agreeContractor: v })}
        label="Independent Contractor Agreement"
        description="I understand I am an independent contractor (1099), not an employee. I'm responsible for my own taxes, schedule, and equipment."
        link="/join/agreement#contractor"
      />

      <AgreementCheck
        checked={form.agreeAntiCircumvent}
        onChange={(v) => onChange({ agreeAntiCircumvent: v })}
        label="Anti-Circumvention Agreement"
        description="I agree NOT to contact, solicit, or accept work from BubbleBox customers outside the platform. Violation results in immediate removal and a penalty."
        link="/join/agreement#anti-circumvent"
      />

      <AgreementCheck
        checked={form.agreePlatformTerms}
        onChange={(v) => onChange({ agreePlatformTerms: v })}
        label="Platform Terms & Pro Code of Conduct"
        description="I agree to BubbleBox's standards: punctuality, respect, professionalism, customer privacy, and quality of work."
        link="/join/agreement#platform"
      />

      <AgreementCheck
        checked={form.agreeBackgroundCheck}
        onChange={(v) => onChange({ agreeBackgroundCheck: v })}
        label="Background Check Consent"
        description="I consent to BubbleBox running a background check, including criminal history and identity verification."
        link="/join/agreement#background"
      />

      <AgreementCheck
        checked={form.agreeBackgroundDocsLater}
        onChange={(v) => onChange({ agreeBackgroundDocsLater: v })}
        label="Documentation Within 7 Days"
        description="I'll provide a photo of my driver's license, completed W-9, and proof of insurance (if applicable) within 7 days of approval."
      />

      <AgreementCheck
        checked={form.agreeStripeOnboardLater}
        onChange={(v) => onChange({ agreeStripeOnboardLater: v })}
        label="Stripe Payout Setup"
        description="I'll complete Stripe payout onboarding within 7 days. BubbleBox pays daily via Stripe — Stripe collects banking info securely."
      />
    </div>
  );
}

function ReviewStep({ form }: { form: FormState }) {
  const zips = form.zipsRaw
    .split(/[,\s]+/)
    .map((z) => z.trim())
    .filter((z) => z.length === 5)
    .filter(isInServiceArea);

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "white",
        border: "1px solid var(--color-rule)",
      }}
    >
      <div className="p-5" style={{ background: "var(--color-surface)" }}>
        <h3 className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>
          {form.firstName} {form.lastName}
        </h3>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          Application summary
        </p>
      </div>
      <dl className="divide-y" style={{ borderColor: "var(--color-rule)" }}>
        <Row label="Phone" value={formatPhoneForDisplay(form.phone)} />
        <Row label="Email" value={form.email} />
        <Row label="Experience" value={form.yearsExperience || "—"} />
        <Row
          label="Services"
          value={
            form.services
              .map((id) => SERVICES_OFFERED.find((s) => s.id === id)?.label)
              .filter(Boolean)
              .join(", ") || "—"
          }
        />
        <Row label="ZIPs" value={`${zips.length} (${zips.slice(0, 3).join(", ")}${zips.length > 3 ? "..." : ""})`} />
        <Row
          label="Transportation"
          value={form.hasTransportation ? "Yes" : "No"}
        />
        <Row
          label="Insurance"
          value={form.hasInsurance ? "Yes" : "No"}
        />
      </dl>
      <div
        className="p-4 text-xs"
        style={{
          background: "var(--color-surface)",
          color: "var(--color-muted)",
          borderTop: "1px solid var(--color-rule)",
        }}
      >
        After you submit, we&apos;ll review within 24-48 hours and text you
        next steps. Approved pros receive job offers via SMS.
      </div>
    </div>
  );
}

/* =================== Helpers =================== */

const formInputCSS = `
  .form-input {
    width: 100%;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 16px;
    background: white;
    border: 2px solid var(--color-rule);
    color: var(--color-ink);
  }
  .form-input:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

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
        className="mb-2 block text-sm font-semibold"
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

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 cursor-pointer accent-[var(--color-accent)]"
      />
      <span className="text-sm" style={{ color: "var(--color-ink)" }}>
        {label}
      </span>
    </label>
  );
}

function AgreementCheck({
  checked,
  onChange,
  label,
  description,
  link,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  link?: string;
}) {
  return (
    <label
      className="flex cursor-pointer gap-3 rounded-xl p-4 transition-colors"
      style={{
        background: checked ? "var(--color-surface)" : "white",
        border: `1px solid ${
          checked ? "var(--color-accent)" : "var(--color-rule)"
        }`,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 cursor-pointer accent-[var(--color-accent)]"
      />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-semibold" style={{ color: "var(--color-ink)" }}>
            {label}
          </span>
          {link && (
            <Link
              href={link}
              target="_blank"
              className="text-xs underline whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
            >
              Read full
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          {description}
        </p>
      </div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-5 py-3 text-sm">
      <dt style={{ color: "var(--color-muted)" }}>{label}</dt>
      <dd
        className="text-right font-medium"
        style={{ color: "var(--color-ink)" }}
      >
        {value}
      </dd>
    </div>
  );
}

function stepHeading(step: number): string {
  return ["Join BubbleBox", "About your service", "Review the agreements", "Almost there"][step];
}

function stepSubhead(step: number): string {
  return [
    "Tell us a bit about yourself. Takes about 3 minutes.",
    "Where you work and what you offer.",
    "Read each one carefully — these are legally binding.",
    "Review your application before submitting.",
  ][step];
}

function validateStep(step: number, form: FormState): boolean {
  switch (step) {
    case 0:
      return (
        form.firstName.trim().length >= 1 &&
        form.lastName.trim().length >= 1 &&
        toE164USPhone(form.phone) !== null &&
        /\S+@\S+\.\S+/.test(form.email) &&
        form.yearsExperience.length > 0
      );
    case 1: {
      const zips = form.zipsRaw
        .split(/[,\s]+/)
        .map((z) => z.trim())
        .filter((z) => z.length === 5)
        .filter(isInServiceArea);
      return form.services.length >= 1 && zips.length >= 1;
    }
    case 2:
      return (
        form.agreeContractor &&
        form.agreeAntiCircumvent &&
        form.agreePlatformTerms &&
        form.agreeBackgroundCheck &&
        form.agreeBackgroundDocsLater &&
        form.agreeStripeOnboardLater
      );
    case 3:
      return true;
    default:
      return false;
  }
}
