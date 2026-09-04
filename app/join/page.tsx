"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { toE164USPhone } from "@/lib/api";
import { JOIN_COPY, type Lang } from "@/lib/i18n-join";
import { FlagSwitcher } from "@/components/FlagSwitcher";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.homeproatl.xyz";

const SERVICE_IDS = ["standard-cleaning", "deep-cleaning", "airbnb-turnover", "move-in-out", "post-construction", "office-cleaning"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_IDS = ["morning", "afternoon", "evening", "flexible"];

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
  const [lang, setLang] = useState<Lang>("en");
  const t = JOIN_COPY[lang];
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
  const [workAuth, setWorkAuth] = useState(false);

  function toggleSet(set: Set<string>, key: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  }

  async function submit() {
    setError(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) return setError(t.errName);
    if (!email.includes("@")) return setError(t.errEmail);
    const phoneE164 = toE164USPhone(phone);
    if (!phoneE164) return setError(t.errPhone);
    if (zip.length !== 5) return setError(t.errZip);
    if (services.size === 0) return setError(t.errServices);
    if (days.size === 0) return setError(t.errDays);
    if (!transport) return setError(t.errTransport);
    if (!workAuth) return setError(t.errWorkAuth);
    if (!bgConsent || !termsConsent) return setError(t.errConsent);

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
        work_authorization_attested: workAuth,
        will_provide_documents: termsConsent,
        will_complete_stripe_onboarding: termsConsent,
      },
      // Extra context for review (stored in notes / not validated server-side)
      bio: bio.trim() || undefined,
      preferred_hours: [...hours],
      preferred_days: [...days],
      has_supplies: supplies === "yes",
      applied_in_language: lang,
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
      setError(t.errNetwork);
      setSubmitting(false);
    }
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <>
        <Header rightSlot={<FlagSwitcher lang={lang} onChange={setLang} />} />
        <main style={{ minHeight: "70vh", padding: "60px 24px", background: "var(--color-paper)" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "var(--shadow-card)" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--color-ink)", letterSpacing: "-0.5px", marginBottom: 12 }}>{t.successTitle}</h1>
            <p style={{ fontSize: 15, color: "var(--color-ink-mid)", lineHeight: 1.6, marginBottom: 28 }}>
              {t.successBody}
            </p>
            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {t.successSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-surface)", border: "1px solid var(--color-surface-mid)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "var(--color-ink)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-accent)", color: "white", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>
            <Link href="/" style={{ display: "inline-block", background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", borderRadius: 50, padding: "14px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(29,127,232,0.35)" }}>
              {t.backHome}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header rightSlot={<FlagSwitcher lang={lang} onChange={setLang} />} />

      {/* HERO */}
      <section style={{ padding: "60px 24px 48px", background: "linear-gradient(135deg, var(--color-accent-deep) 0%, var(--color-accent-mid) 50%, var(--color-accent) 100%)", color: "white", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 99, padding: "6px 14px", fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            {t.hiringBadge}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.05, letterSpacing: "-1px", marginBottom: 16 }}>
            {t.heroTitle1}<br /><em style={{ color: "#FFD700", fontStyle: "italic" }}>{t.heroTitle2}</em>
          </h1>
          <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 24px" }}>
            {t.heroSub}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
            {t.heroPills.map(p => (
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
            <div style={styles.eyebrow}>{t.perksEyebrow}</div>
            <h2 style={styles.sectionTitle}>{t.perksTitle}</h2>
            <p style={styles.sectionSub}>We built BubbleBox to be the best place to work as a cleaner in Atlanta.</p>
          </div>
          <div className="perks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {t.perks.map(p => (
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
            <div style={styles.eyebrow}>{t.stepsEyebrow}</div>
            <h2 style={styles.sectionTitle}>{t.stepsTitle}</h2>
            <p style={styles.sectionSub}>{t.stepsSub}</p>
          </div>
          <div className="steps-grid-join" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {t.steps.map(s => (
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
            <div style={styles.eyebrow}>{t.formEyebrow}</div>
            <h2 style={styles.sectionTitle}>{t.formTitle}</h2>
            <p style={styles.sectionSub}>All applications are reviewed within 2–3 business days. We'll reach out by phone or email.</p>
          </div>

          <div style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
            <div style={{ background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-mid) 100%)", padding: "20px 24px", borderBottom: "1.5px solid var(--color-rule)" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-accent-deep)" }}>{t.formCardTitle}</div>
              <div style={{ fontSize: 13, color: "var(--color-ink-mid)", marginTop: 4 }}>{t.formCardSub}</div>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Personal Info */}
              <div>
                <div style={styles.formSectionTitle}>{t.secPersonal}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <div className="field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label={t.firstName} required>
                      <input type="text" placeholder="Jane" autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} style={styles.input} />
                    </Field>
                    <Field label={t.lastName} required>
                      <input type="text" placeholder="Smith" autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} style={styles.input} />
                    </Field>
                  </div>
                  <div className="field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label={t.emailLabel} required>
                      <input type="email" placeholder="jane@email.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} />
                    </Field>
                    <Field label={t.phoneLabel} required>
                      <input type="tel" placeholder="(404) 555-0123" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} />
                    </Field>
                  </div>
                  <Field label={t.zipLabel} required hint="we match jobs near you">
                    <input type="text" inputMode="numeric" maxLength={5} placeholder="30308" value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} style={styles.input} />
                  </Field>
                </div>
              </div>

              {/* Experience */}
              <div>
                <div style={styles.formSectionTitle}>{t.secExperience}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <Field label={t.experienceLabel} required>
                    <select value={experience} onChange={e => setExperience(e.target.value)} style={styles.input}>
                      {t.experience.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label={t.bioLabel} hint={t.optional}>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={t.bioPlaceholder} rows={3} style={{ ...styles.input, resize: "vertical", minHeight: 90 }} />
                  </Field>
                  <Field label={t.servicesLabel}>
                    <CheckGrid items={SERVICE_IDS.map(id => ({ id, label: t.services[id] }))} selected={services} onToggle={id => toggleSet(services, id, setServices)} />
                  </Field>
                </div>
              </div>

              {/* Availability */}
              <div>
                <div style={styles.formSectionTitle}>{t.secAvailability}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <Field label={t.daysLabel} required>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                      {DAYS.map(d => {
                        const sel = days.has(d);
                        return (
                          <button key={d} type="button" onClick={() => toggleSet(days, d, setDays)} style={{ background: sel ? "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)" : "white", color: sel ? "white" : "var(--color-ink)", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 10, padding: "10px 4px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                            {t.days[d].toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label={t.hoursLabel}>
                    <CheckGrid items={HOUR_IDS.map(id => ({ id, label: t.hours[id] }))} selected={hours} onToggle={id => toggleSet(hours, id, setHours)} />
                  </Field>
                </div>
              </div>

              {/* Logistics */}
              <div>
                <div style={styles.formSectionTitle}>{t.secLogistics}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  <Field label={t.transportLabel} required>
                    <RadioGrid items={[{ id: "yes", label: t.transportYes }, { id: "no", label: t.transportNo }]} value={transport} onChange={v => setTransport(v as "yes" | "no")} />
                  </Field>
                  <Field label={t.suppliesLabel}>
                    <RadioGrid items={[{ id: "yes", label: t.suppliesYes }, { id: "no", label: t.suppliesNo }]} value={supplies} onChange={v => setSupplies(v as "yes" | "no")} />
                  </Field>
                </div>
              </div>

              {/* Consent */}
              <div>
                <div style={styles.formSectionTitle}>{t.secConsent}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                  <ConsentBox checked={workAuth} onClick={() => setWorkAuth(!workAuth)}>
                    <strong>{t.workAuthTitle}</strong> — {t.workAuthText}
                  </ConsentBox>
                  <ConsentBox checked={bgConsent} onClick={() => setBgConsent(!bgConsent)}>
                    <strong>{t.idConsentTitle}</strong> — {t.idConsentText}
                  </ConsentBox>
                  <ConsentBox checked={termsConsent} onClick={() => setTermsConsent(!termsConsent)}>
                    <strong>{t.termsTitle}</strong> — {t.termsText} <Link href="/terms" style={{ color: "var(--color-accent)" }}>{t.termsLink}</Link> · <Link href="/privacy" style={{ color: "var(--color-accent)" }}>{t.privacyLink}</Link>.
                  </ConsentBox>
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 14, color: "var(--color-danger)", fontWeight: 500 }}>{error}</div>
              )}

              <div>
                <button onClick={submit} disabled={submitting} style={{ width: "100%", background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", border: "none", borderRadius: 50, padding: "16px 24px", fontSize: 16, fontWeight: 700, cursor: submitting ? "wait" : "pointer", boxShadow: "0 6px 24px rgba(29,127,232,0.35)", opacity: submitting ? 0.7 : 1, fontFamily: "inherit" }}>
                  {submitting ? t.submitting : t.submit}
                </button>
                <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-muted)", textAlign: "center", lineHeight: 1.5 }}>
                  {t.footerNote} <a href="tel:+16788204881" style={{ color: "var(--color-accent)" }}>(678) 820-4881</a>
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
