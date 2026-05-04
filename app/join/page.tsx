"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { toE164USPhone } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

const SERVICE_OPTIONS = [
  { id: "standard-cleaning", label: "🧹 Standard Cleaning" },
  { id: "deep-cleaning", label: "✨ Deep Cleaning" },
  { id: "airbnb-turnover", label: "🏠 Airbnb Turnover" },
  { id: "move-in-out", label: "📦 Move In/Out" },
  { id: "post-construction", label: "🏗️ Post-Construction" },
  { id: "office-cleaning", label: "🏢 Office/Commercial" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  { id: "morning", label: "☀️ Morning (8am–12pm)" },
  { id: "afternoon", label: "🌤️ Afternoon (12pm–5pm)" },
  { id: "evening", label: "🌙 Evening (5pm–8pm)" },
  { id: "flexible", label: "🔄 Flexible / Any time" },
];
const EXPERIENCE_OPTS = [
  { value: "", label: "Select experience level" },
  { value: "none", label: "No experience — willing to learn" },
  { value: "<1", label: "Less than 1 year" },
  { value: "1-2", label: "1–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5+", label: "5+ years" },
];
const PERKS = [
  { icon: "💵", title: "Daily Pay", desc: "Get paid the same day you work — just like Uber. Direct deposit, no waiting, no delays." },
  { icon: "🗓️", title: "Flexible Schedule", desc: "You choose when you work. Set your own availability and take the days off you need." },
  { icon: "📍", title: "Work Close to Home", desc: "We match you with jobs in your neighborhood to minimize commute time and maximize earnings." },
  { icon: "💰", title: "Keep Your Tips", desc: "100% of customer tips go directly to you. Great service means great extra income." },
  { icon: "🎓", title: "Training Provided", desc: "No experience? No problem. We train you on our professional cleaning standards at no cost." },
  { icon: "📱", title: "Easy App", desc: "Manage jobs, track earnings, and chat with customers all in one simple app." },
];
const STEPS = [
  { num: "1", title: "Apply Online", desc: "Fill out the short application below. Takes about 5 minutes." },
  { num: "2", title: "Background Check", desc: "We run a quick background check to keep our customers safe." },
  { num: "3", title: "Quick Interview", desc: "A short phone or video call with our team to get to know you." },
  { num: "4", title: "Start Earning", desc: "Get approved and start receiving jobs in your area right away." },
];

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, color: "var(--color-accent)", marginBottom: 10 },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.15, letterSpacing: "-0.5px", color: "var(--color-ink)", marginBottom: 12 },
  sectionSub: { fontSize: 16, color: "var(--color-ink-mid)", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 },
  fieldLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 6, display: "block" },
  input: { width: "100%", padding: "12px 14px", border: "2px solid var(--color-rule)", borderRadius: 10, fontSize: 15, color: "var(--color-ink)", background: "white", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" },
  formSectionTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-accent-deep)", marginBottom: 4, paddingBottom: 10, borderBottom: "2px solid var(--color-surface)" },
};

export default function JoinPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [services, setServices] = useState<Set<string>>(new Set());
  const [days, setDays] = useState<Set<string>>(new Set());
  const [hours, setHours] = useState<Set<string>>(new Set());
  const [transport, setTransport] = useState<"yes" | "no" | "">("");
  const [supplies, setSupplies] = useState<"yes" | "no" | "">("");
  const [bgConsent, setBgConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  function toggleSet(set: Set<string>, key: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  }

  async function submit() {
    setError(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) return setError("Please enter your full name.");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    const phoneE164 = toE164USPhone(phone);
    if (!phoneE164) return setError("Please enter a valid US phone number.");
    if (zip.length !== 5) return setError("Please enter your 5-digit ZIP code.");
    if (services.size === 0) return setError("Please select at least one service type.");
    if (days.size === 0) return setError("Please select at least one available day.");
    if (!transport) return setError("Please tell us about your transportation.");
    if (!bgConsent || !termsConsent) return setError("Please check both consent boxes to continue.");

    setSubmitting(true);

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phoneE164,
      email: email.trim(),
      service_zips: [zip],
      services: [...services],
      has_insurance: false,
      has_transportation: transport === "yes",
      years_experience: experience || "none",
      agreed_at: new Date().toISOString(),
      agreements: {
        independent_contractor: termsConsent,
        anti_circumvention: termsConsent,
        platform_terms: termsConsent,
        background_check_consent: bgConsent,
        will_provide_documents: termsConsent,
        will_complete_stripe_onboarding: termsConsent,
      },
      // Extra context for review (stored in notes / not validated server-side)
      bio: bio.trim() || undefined,
      preferred_hours: [...hours],
      preferred_days: [...days],
      has_supplies: supplies === "yes",
    };

    try {
      const res = await fetch(`${API_BASE}/api/pros/applications/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        const msg = body.error?.message || "Something went wrong. Please try again.";
        const details = body.error?.details?.map((d: any) => d.message).join(", ");
        setError(details ? `${msg} (${details})` : msg);
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Couldn't reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "70vh", padding: "60px 24px", background: "var(--color-paper)" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "var(--shadow-card)" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--color-ink)", letterSpacing: "-0.5px", marginBottom: 12 }}>Application submitted!</h1>
            <p style={{ fontSize: 15, color: "var(--color-ink-mid)", lineHeight: 1.6, marginBottom: 28 }}>
              Thanks for applying to BubbleBox ATL! Our team will review your application and reach out within 2–3 business days.
            </p>
            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {[
                "We'll review your application",
                "We'll send a background check consent link to your email",
                "We'll schedule a quick phone interview",
                "Get approved and start earning!",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-surface)", border: "1px solid var(--color-surface-mid)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "var(--color-ink)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent)", color: "white", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>
            <Link href="/" style={{ display: "inline-block", background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", borderRadius: 50, padding: "14px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(29,127,232,0.35)" }}>
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section style={{ padding: "60px 24px 48px", background: "linear-gradient(135deg, var(--color-accent-deep) 0%, var(--color-accent-mid) 50%, var(--color-accent) 100%)", color: "white", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 99, padding: "6px 14px", fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            Now Hiring in Atlanta
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.05, letterSpacing: "-1px", marginBottom: 16 }}>
            Get paid to clean.<br /><em style={{ color: "#FFD700", fontStyle: "italic" }}>On your schedule.</em>
          </h1>
          <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 24px" }}>
            Join the BubbleBox ATL team and build a flexible cleaning career you love. Daily pay, great customers, and work close to home.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
            {["💵 Daily pay", "🗓️ Flexible schedule", "📍 Work near home", "💰 Keep your tips", "🎓 Training provided", "🚀 No experience needed"].map(p => (
              <span key={p} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 99, padding: "8px 14px", fontSize: 13, fontWeight: 600 }}>{p}</span>
            ))}
          </div>
          <a href="#apply" style={{ display: "inline-block", background: "white", color: "var(--color-accent-deep)", borderRadius: 50, padding: "14px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.18)", transition: "all 0.2s" }}>
            Apply in 5 Minutes ↓
          </a>
        </div>
      </section>

      {/* PERKS */}
      <section style={{ padding: "72px 24px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={styles.eyebrow}>Why BubbleBox</div>
            <h2 style={styles.sectionTitle}>A cleaning job that works for you</h2>
            <p style={styles.sectionSub}>We built BubbleBox to be the best place to work as a cleaner in Atlanta.</p>
          </div>
          <div className="perks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {PERKS.map(p => (
              <div key={p.title} style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, padding: 24, boxShadow: "var(--shadow-soft)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-ink)", marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: "var(--color-ink-mid)", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "72px 24px", background: "var(--color-paper)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={styles.eyebrow}>Simple Process</div>
            <h2 style={styles.sectionTitle}>How to get started</h2>
            <p style={styles.sectionSub}>From application to your first job in as little as 3–5 business days.</p>
          </div>
          <div className="steps-grid-join" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {STEPS.map(s => (
              <div key={s.num} style={{ textAlign: "center", padding: 20 }}>
                <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, fontWeight: 800, color: "white", boxShadow: "0 6px 20px rgba(29,127,232,0.35)" }}>{s.num}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-ink)", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "var(--color-ink-mid)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION */}
      <section id="apply" style={{ padding: "72px 24px", background: "white" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={styles.eyebrow}>Application</div>
            <h2 style={styles.sectionTitle}>Apply to join the team</h2>
            <p style={styles.sectionSub}>All applications are reviewed within 2–3 business days. We'll reach out by phone or email.</p>
          </div>

          <div style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <div style={{ background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-mid) 100%)", padding: "20px 24px", borderBottom: "1.5px solid var(--color-rule)" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-accent-deep)" }}>Cleaner Application</div>
              <div style={{ fontSize: 13, color: "var(--color-ink-mid)", marginTop: 4 }}>All fields marked with * are required. Takes about 5 minutes.</div>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Personal Info */}
              <div>
                <div style={styles.formSectionTitle}>Personal Information</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <div className="field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="First Name" required>
                      <input type="text" placeholder="Jane" autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} style={styles.input} />
                    </Field>
                    <Field label="Last Name" required>
                      <input type="text" placeholder="Smith" autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} style={styles.input} />
                    </Field>
                  </div>
                  <div className="field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Email Address" required>
                      <input type="email" placeholder="jane@email.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} />
                    </Field>
                    <Field label="Phone Number" required>
                      <input type="tel" placeholder="(404) 555-0123" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} />
                    </Field>
                  </div>
                  <Field label="Home ZIP Code" required hint="we match jobs near you">
                    <input type="text" inputMode="numeric" maxLength={5} placeholder="30308" value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} style={styles.input} />
                  </Field>
                </div>
              </div>

              {/* Experience */}
              <div>
                <div style={styles.formSectionTitle}>Experience</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <Field label="Years of cleaning experience" required>
                    <select value={experience} onChange={e => setExperience(e.target.value)} style={styles.input}>
                      {EXPERIENCE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Tell us about yourself" hint="optional">
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Why do you want to join BubbleBox? Any relevant experience or skills?" rows={3} style={{ ...styles.input, resize: "vertical", minHeight: 90 }} />
                  </Field>
                  <Field label="Service types you're comfortable with">
                    <CheckGrid items={SERVICE_OPTIONS} selected={services} onToggle={id => toggleSet(services, id, setServices)} />
                  </Field>
                </div>
              </div>

              {/* Availability */}
              <div>
                <div style={styles.formSectionTitle}>Availability</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <Field label="Days available" required>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                      {DAYS.map(d => {
                        const sel = days.has(d);
                        return (
                          <button key={d} type="button" onClick={() => toggleSet(days, d, setDays)} style={{ background: sel ? "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)" : "white", color: sel ? "white" : "var(--color-ink)", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 10, padding: "10px 4px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                            {d.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Preferred hours">
                    <CheckGrid items={HOURS} selected={hours} onToggle={id => toggleSet(hours, id, setHours)} />
                  </Field>
                </div>
              </div>

              {/* Logistics */}
              <div>
                <div style={styles.formSectionTitle}>Logistics</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <Field label="Reliable transportation?" required>
                    <RadioGrid items={[{ id: "yes", label: "🚗 Yes, I have a car" }, { id: "no", label: "🚌 No, I use transit" }]} value={transport} onChange={v => setTransport(v as "yes" | "no")} />
                  </Field>
                  <Field label="Do you have your own cleaning supplies?">
                    <RadioGrid items={[{ id: "yes", label: "✅ Yes, I have supplies" }, { id: "no", label: "❌ No, I'll need them" }]} value={supplies} onChange={v => setSupplies(v as "yes" | "no")} />
                  </Field>
                </div>
              </div>

              {/* Consent */}
              <div>
                <div style={styles.formSectionTitle}>Consent &amp; Agreement</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                  <ConsentBox checked={bgConsent} onClick={() => setBgConsent(!bgConsent)}>
                    <strong>Background check consent</strong> — I authorize BubbleBox ATL to conduct a background check as part of the hiring process. I understand this is required for all applicants.
                  </ConsentBox>
                  <ConsentBox checked={termsConsent} onClick={() => setTermsConsent(!termsConsent)}>
                    <strong>Terms agreement</strong> — I certify that the information provided is accurate and complete. I agree to BubbleBox ATL's <Link href="/terms" style={{ color: "var(--color-accent)" }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: "var(--color-accent)" }}>Privacy Policy</Link>.
                  </ConsentBox>
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 14, color: "var(--color-danger)", fontWeight: 500 }}>{error}</div>
              )}

              <div>
                <button onClick={submit} disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", border: "none", borderRadius: 50, padding: "16px 24px", fontSize: 16, fontWeight: 700, cursor: submitting ? "wait" : "pointer", boxShadow: "0 6px 24px rgba(29,127,232,0.35)", opacity: submitting ? 0.7 : 1, fontFamily: "inherit" }}>
                  {submitting ? "Submitting…" : "Submit Application →"}
                </button>
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-muted)", textAlign: "center", lineHeight: 1.5 }}>
                  Applications are reviewed within 2–3 business days. We'll contact you at the email and phone number provided. Questions? Call us at <a href="tel:+16788204881" style={{ color: "var(--color-accent)" }}>(678) 820-4881</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:768px){
          .perks-grid{grid-template-columns:1fr 1fr!important}
          .steps-grid-join{grid-template-columns:1fr 1fr!important}
          .field-row{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .perks-grid{grid-template-columns:1fr!important}
          .steps-grid-join{grid-template-columns:1fr!important}
        }
      `}</style>
    </>
  );
}

// ── Reusable subcomponents ──

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 6, display: "block" }}>
        {label} {required && <span style={{ color: "var(--color-danger)" }}>*</span>}
        {hint && <span style={{ fontWeight: 400, color: "var(--color-muted)", fontSize: 12, marginLeft: 4 }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function CheckGrid({ items, selected, onToggle }: { items: { id: string; label: string }[]; selected: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map(item => {
        const sel = selected.has(item.id);
        return (
          <button key={item.id} type="button" onClick={() => onToggle(item.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: sel ? "var(--color-surface)" : "white", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, color: sel ? "var(--color-accent-deep)" : "var(--color-ink-mid)", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, background: sel ? "var(--color-accent)" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {sel && <svg width={10} height={7} viewBox="0 0 10 7" fill="none"><path d="M1 3.5l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function RadioGrid({ items, value, onChange }: { items: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map(item => {
        const sel = value === item.id;
        return (
          <button key={item.id} type="button" onClick={() => onChange(item.id)} style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: 8, background: sel ? "var(--color-surface)" : "white", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 10, padding: "12px 14px", fontSize: 14, fontWeight: 600, color: sel ? "var(--color-accent-deep)" : "var(--color-ink-mid)", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, background: sel ? "var(--color-accent)" : "white", flexShrink: 0, position: "relative" }}>
              {sel && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "white" }} />}
            </div>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ConsentBox({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} style={{ display: "flex", gap: 12, padding: 14, background: checked ? "var(--color-surface)" : "white", border: `2px solid ${checked ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}>
      <div style={{ width: 22, height: 22, minWidth: 22, borderRadius: 5, border: `2px solid ${checked ? "var(--color-accent)" : "var(--color-rule)"}`, background: checked ? "var(--color-accent)" : "white", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
        {checked && <svg width={12} height={9} viewBox="0 0 12 9" fill="none"><path d="M1 4.5l3.5 3.5 6-6" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-ink-mid)", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}
