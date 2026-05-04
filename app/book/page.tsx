"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BubbleLogo } from "@/components/Chrome";
import { SERVICES, formatPrice, type ServiceId } from "@/lib/services";
import { isInServiceArea } from "@/lib/service-area";
import { createBooking, toE164USPhone, formatPhoneForDisplay, BookingError } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────
type Window = "morning" | "afternoon" | "evening";
type PayMethod = "card" | "applepay" | "googlepay" | "cashapp";

interface BookingState {
  service: ServiceId | null;
  bedrooms: number;
  bathrooms: number;
  halfBaths: number;
  addons: Set<string>;
  frequency: string;
  date: string;
  time: string;
  address: string;
  apt: string;
  city: string;
  zip: string;
  stateCode: string;
  specialInstructions: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  payMethod: PayMethod;
  cardName: string;
  cardNum: string;
  cardExp: string;
  cardCvv: string;
}

// ── Pricing constants ──────────────────────────────────────────────────
const BASE_PRICES: Record<string, number> = { "standard-cleaning":99,"deep-cleaning":169,"move-in-out":219,"airbnb-turnover":109,"post-construction":279,"office-cleaning":129 };
const BED_PRICE = 25, BATH_PRICE = 30, HALF_BATH = 15;
const ADDON_PRICES: Record<string, number> = { ownsupplies:-10,oven:45,fridge:35,windows:50,laundry:30,cabinets:40,garage:60,patio:55,walls:70,blinds:35 };
const FREQ_DISCOUNTS: Record<string, number> = { once:0,weekly:0.20,biweekly:0.15,monthly:0.10 };

const ADDONS = [
  { id:"ownsupplies",icon:"🧴",name:"I'll Provide My Own Supplies",desc:"Save $10 when you supply your own cleaning products",price:"-$10",discount:true },
  { id:"oven",icon:"🍳",name:"Inside Oven",desc:"Deep clean oven interior & racks",price:"+$45" },
  { id:"fridge",icon:"❄️",name:"Inside Fridge",desc:"Full refrigerator interior clean",price:"+$35" },
  { id:"windows",icon:"🪟",name:"Interior Windows",desc:"Clean windows, sills & tracks",price:"+$50" },
  { id:"laundry",icon:"👕",name:"Laundry (Wash & Dry)",desc:"Up to 2 loads washed & dried",price:"+$30" },
  { id:"cabinets",icon:"🗄️",name:"Inside Cabinets",desc:"Kitchen & bathroom cabinets",price:"+$40" },
  { id:"garage",icon:"🚗",name:"Garage Sweep",desc:"Sweep & tidy the garage",price:"+$60" },
  { id:"patio",icon:"🌿",name:"Patio / Balcony",desc:"Sweep & wipe outdoor surfaces",price:"+$55" },
  { id:"walls",icon:"🖼️",name:"Wall Spot Cleaning",desc:"Remove marks & scuffs",price:"+$70" },
  { id:"blinds",icon:"🪞",name:"Blinds Cleaning",desc:"Wipe down all window blinds",price:"+$35" },
];

const FREQUENCIES = [
  { id:"once",icon:"1️⃣",name:"One-Time",desc:"Single visit, no commitment",discount:null },
  { id:"weekly",icon:"📅",name:"Weekly",desc:"Every week, same day",discount:"Save 20%" },
  { id:"biweekly",icon:"🔄",name:"Bi-Weekly",desc:"Every two weeks",discount:"Save 15%" },
  { id:"monthly",icon:"🗓️",name:"Monthly",desc:"Once per month",discount:"Save 10%" },
];

const TIME_SLOTS = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"];

const STEP_NAMES = ["Choose Service","Home Size","Add-Ons","Frequency","Date & Time","Your Address","Contact Info","Payment","Review & Confirm"];

function defaultState(): BookingState {
  return { service:null,bedrooms:1,bathrooms:1,halfBaths:0,addons:new Set(),frequency:"once",date:"",time:"",address:"",apt:"",city:"Atlanta",zip:"",stateCode:"GA",specialInstructions:"",firstName:"",lastName:"",email:"",phone:"",payMethod:"card",cardName:"",cardNum:"",cardExp:"",cardCvv:"" };
}

// ── Main component ─────────────────────────────────────────────────────
export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(defaultState);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [showSuppliesModal, setShowSuppliesModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmData, setConfirmData] = useState<{ bookingId: string; price: number } | null>(null);

  // Pre-fill from URL params
  useEffect(() => {
    const zip = searchParams.get("zip");
    const service = searchParams.get("service") as ServiceId | null;
    if (zip || service) {
      setState(s => ({ ...s, zip: zip ?? s.zip, service: service ?? s.service }));
      if (service) setStep(2);
    }
  }, []);

  function calcTotal() {
    if (!state.service) return 0;
    let base = BASE_PRICES[state.service] || 0;
    base += (state.bedrooms - 1) * BED_PRICE;
    base += (state.bathrooms - 1) * BATH_PRICE;
    base += state.halfBaths * HALF_BATH;
    state.addons.forEach(a => { base += ADDON_PRICES[a] || 0; });
    return Math.round(base * (1 - (FREQ_DISCOUNTS[state.frequency] || 0)));
  }

  function update(patch: Partial<BookingState>) {
    setState(s => ({ ...s, ...patch }));
  }

  function toggleAddon(id: string) {
    if (id === "ownsupplies" && !state.addons.has(id)) { setShowSuppliesModal(true); return; }
    const next = new Set(state.addons);
    if (next.has(id)) next.delete(id); else next.add(id);
    update({ addons: next });
  }

  function validateStep() {
    switch (step) {
      case 1: return !!state.service;
      case 5: return !!state.date && !!state.time;
      case 6: return state.address.trim().length >= 5 && state.zip.length === 5;
      case 7: return state.firstName.trim().length >= 1 && state.lastName.trim().length >= 1 && state.email.includes("@") && toE164USPhone(state.phone) !== null;
      default: return true;
    }
  }

  async function handleConfirm() {
    const phoneE164 = toE164USPhone(state.phone);
    if (!phoneE164) { setServerError("Please enter a valid US phone number."); return; }

    setSubmitting(true);
    setServerError(null);

    const addressLine = [state.address, state.apt].filter(Boolean).join(", ");
    const addonNames = [...state.addons].filter(id => id !== "ownsupplies").map(id => ADDONS.find(a => a.id === id)?.name).filter(Boolean);
    const suppliesNote = state.addons.has("ownsupplies") ? "Customer will provide own supplies ($10 discount applied)." : "";
    const notes = [state.specialInstructions, suppliesNote, addonNames.length ? "Add-ons: " + addonNames.join(", ") : ""].filter(Boolean).join(" | ");

    const windowMap: Record<string,Window> = { "8:00 AM":"morning","9:00 AM":"morning","10:00 AM":"morning","11:00 AM":"morning","12:00 PM":"afternoon","1:00 PM":"afternoon","2:00 PM":"afternoon","3:00 PM":"afternoon","4:00 PM":"afternoon","5:00 PM":"evening","6:00 PM":"evening","7:00 PM":"evening","8:00 PM":"evening" };

    try {
      const res = await createBooking({
        service_id: state.service!,
        zip: state.zip,
        preferred_date: state.date,
        preferred_window: windowMap[state.time] || "morning",
        address_line: addressLine,
        notes: notes || undefined,
        customer: { name: `${state.firstName} ${state.lastName}`.trim(), phone: phoneE164, email: state.email || undefined },
      });

      try { sessionStorage.setItem(`booking-phone-${res.id}`, phoneE164); } catch {}
      setConfirmData({ bookingId: res.id, price: calcTotal() });
      setConfirmed(true);
    } catch (err) {
      if (err instanceof BookingError) {
        setServerError(err.details?.length ? "Some details look off: " + err.details.map(d => d.message).join(", ") : err.message);
      } else {
        setServerError("Couldn't reach the booking server. Check your connection and try again.");
      }
    } finally { setSubmitting(false); }
  }

  // ── Confirmation screen ────────────────────────────────────────────
  if (confirmed && confirmData) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-paper)", fontFamily: "var(--font-sans)" }}>
        <AppHeader />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: "bounce 0.6s ease" }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.5px", marginBottom: 8 }}>You're all booked!</h1>
          <p style={{ fontSize: 15, color: "var(--color-ink-mid)", lineHeight: 1.5, marginBottom: 28, maxWidth: 320, margin: "0 auto 28px" }}>
            Thank you, {state.firstName}! We'll reach out to confirm your appointment shortly.
          </p>
          <div style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, padding: 20, maxWidth: 400, margin: "0 auto 24px", textAlign: "left", boxShadow: "var(--shadow-card)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>Booking Summary</div>
            <SummaryRow label="Confirmation #" value={<span style={{ fontFamily: "monospace", fontSize: 12 }}>{confirmData.bookingId.toUpperCase()}</span>} />
            <SummaryRow label="Date" value={`${state.date ? new Date(state.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—"} · ${state.time}`} />
            <SummaryRow label="Address" value={`${state.address}, ${state.city}`} />
            <SummaryRow label="Total" value={<span style={{ color: "var(--color-accent)", fontSize: 17 }}>${confirmData.price}</span>} />
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#15803d", fontWeight: 600, maxWidth: 400, margin: "0 auto 24px" }}>
            📋 Screenshot this page for your records.
          </div>
          <button onClick={() => { setState(defaultState()); setConfirmed(false); setConfirmData(null); setStep(1); }} style={btnPrimary}>Book Another Cleaning</button>
        </div>
        <style>{`@keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}`}</style>
      </div>
    );
  }

  const price = calcTotal();
  const showPriceBar = step < 9;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-paper)", fontFamily: "var(--font-sans)", display: "flex", flexDirection: "column" }}>
      <AppHeader />

      {/* Progress */}
      <div style={{ background: "white", padding: "10px 20px 14px", borderBottom: "1px solid var(--color-rule)" }} id="progressWrap">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
          <span>Step {step} of {STEP_NAMES.length}</span>
          <span>{STEP_NAMES[step - 1]}</span>
        </div>
        <div style={{ height: 5, background: "var(--color-surface-mid)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-light) 100%)", borderRadius: 99, transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)", width: `${(step / STEP_NAMES.length) * 100}%` }} />
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
          {STEP_NAMES.map((_, i) => (
            <div key={i} style={{ height: 6, borderRadius: 99, background: i + 1 === step ? "var(--color-accent)" : i + 1 < step ? "var(--color-accent-light)" : "var(--color-surface-mid)", transition: "all 0.3s", width: i + 1 === step ? 18 : 6 }} />
          ))}
        </div>
      </div>

      {/* Main content */}
      <main style={{ flex: 1, padding: "24px 20px 140px", maxWidth: 640, margin: "0 auto", width: "100%", animation: "stepIn 0.3s ease" }}>
        {step === 1 && <Step1 state={state} update={update} />}
        {step === 2 && <Step2 state={state} update={update} />}
        {step === 3 && <Step3 state={state} toggleAddon={toggleAddon} showSuppliesModal={showSuppliesModal} setShowSuppliesModal={setShowSuppliesModal} setState={setState} />}
        {step === 4 && <Step4 state={state} update={update} />}
        {step === 5 && <Step5 state={state} update={update} calYear={calYear} calMonth={calMonth} setCalYear={setCalYear} setCalMonth={setCalMonth} />}
        {step === 6 && <Step6 state={state} update={update} />}
        {step === 7 && <Step7 state={state} update={update} />}
        {step === 8 && <Step8 state={state} update={update} calcTotal={calcTotal} />}
        {step === 9 && <Step9 state={state} calcTotal={calcTotal} goToStep={setStep} />}

        {serverError && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 14, color: "var(--color-danger)" }}>{serverError}</div>
        )}
      </main>

      {/* Price bar */}
      {showPriceBar && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid var(--color-rule)", boxShadow: "0 -4px 24px rgba(29,127,232,0.10)", zIndex: 200 }}>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 20px", paddingBottom: "max(12px, env(safe-area-inset-bottom))", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <button onClick={() => { if (step > 1) setStep(s => s - 1); setServerError(null); }} style={{ background: "none", border: "none", color: "var(--color-muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 0", display: "flex", alignItems: "center", gap: 4, visibility: step > 1 ? "visible" : "hidden" }}>
              ← Back
            </button>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estimated Total</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.5px", lineHeight: 1 }}>{price > 0 ? `$${price}` : "--"}</span>
              {state.frequency !== "once" && <span style={{ fontSize: 12, color: "var(--color-muted)" }}>per visit ({state.frequency})</span>}
            </div>
            <button
              onClick={() => { if (step < 9 && validateStep()) setStep(s => s + 1); else if (step === 9) handleConfirm(); }}
              disabled={!validateStep() || submitting}
              style={{ ...btnNext, opacity: (!validateStep() || submitting) ? 0.5 : 1 }}
            >
              {step === 9 ? (submitting ? "Booking..." : "✓ Book Now") : "Continue →"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes stepIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── Step components ────────────────────────────────────────────────────

function Step1({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <>
      <StepHeader eyebrow="Step 1 — Service" title="What type of cleaning do you need?" sub="We serve Atlanta & Metro Atlanta. Select your service to get started." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="service-grid-book">
        {SERVICES.map(s => {
          const sel = state.service === s.id;
          return (
            <button key={s.id} onClick={() => update({ service: s.id as ServiceId })} style={{ background: sel ? "var(--color-accent)" : "white", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 16, padding: "18px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden", transition: "all 0.2s", textAlign: "left" }}>
              {sel && <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={12} height={12} viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
              <div style={{ fontSize: 30 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: sel ? "white" : "var(--color-ink)" }}>{s.name}</div>
              <div style={{ fontSize: 12, color: sel ? "rgba(255,255,255,0.75)" : "var(--color-muted)", lineHeight: 1.4 }}>{s.shortDescription}</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: "auto", color: sel ? "rgba(255,255,255,0.9)" : "var(--color-accent)" }}>From {formatPrice(s.basePriceCents)}</div>
            </button>
          );
        })}
      </div>
      <style>{`@media(min-width:540px){.service-grid-book{grid-template-columns:repeat(3,1fr)!important}}`}</style>
    </>
  );
}

function Step2({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <>
      <StepHeader eyebrow="Step 2 — Home Size" title="How big is your space?" sub="We'll price based on the number of rooms." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { field:"bedrooms",label:"Bedrooms",sub:"Including master bedroom",min:1,max:10,val:state.bedrooms },
          { field:"bathrooms",label:"Full Bathrooms",sub:"With tub or shower",min:0,max:10,val:state.bathrooms },
          { field:"halfBaths",label:"Half Bathrooms",sub:"Toilet & sink only",min:0,max:5,val:state.halfBaths },
        ].map(({ field, label, sub, min, max, val }) => (
          <div key={field} style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}>{label}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{sub}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button disabled={val <= min} onClick={() => update({ [field]: val - 1 } as any)} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--color-rule)", background: "white", cursor: val <= min ? "not-allowed" : "pointer", fontSize: 20, fontWeight: 600, color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", opacity: val <= min ? 0.35 : 1, transition: "all 0.15s" }}>−</button>
              <span style={{ fontSize: 20, fontWeight: 700, color: "var(--color-ink)", minWidth: 28, textAlign: "center" }}>{val}</span>
              <button disabled={val >= max} onClick={() => update({ [field]: val + 1 } as any)} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--color-rule)", background: "white", cursor: val >= max ? "not-allowed" : "pointer", fontSize: 20, fontWeight: 600, color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", opacity: val >= max ? 0.35 : 1, transition: "all 0.15s" }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Step3({ state, toggleAddon, showSuppliesModal, setShowSuppliesModal, setState }: any) {
  return (
    <>
      <StepHeader eyebrow="Step 3 — Add-Ons" title="Want anything extra?" sub="Optional extras added to your cleaning. You can skip this step." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ADDONS.map(a => {
          const sel = state.addons.has(a.id);
          return (
            <div key={a.id} onClick={() => toggleAddon(a.id)} style={{ background: sel ? (a.discount ? "#dcfce7" : "var(--color-surface)") : (a.discount ? "#f0fdf4" : "white"), border: `2px solid ${sel ? (a.discount ? "#16a34a" : "var(--color-accent)") : (a.discount ? "#bbf7d0" : "var(--color-rule)")}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ fontSize: 22, width: 32, textAlign: "center" }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: a.discount ? "#15803d" : "var(--color-ink)" }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{a.desc}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: a.discount ? "#16a34a" : "var(--color-accent)", whiteSpace: "nowrap" }}>{a.price}</div>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sel ? (a.discount ? "#16a34a" : "var(--color-accent)") : "var(--color-rule)"}`, background: sel ? (a.discount ? "#16a34a" : "var(--color-accent)") : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                {sel && <svg width={10} height={7} viewBox="0 0 10 7" fill="none"><path d="M1 3.5l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplies modal */}
      {showSuppliesModal && (
        <div onClick={() => setShowSuppliesModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(13,27,62,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", maxWidth: 640, width: "100%", animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <div style={{ width: 40, height: 4, background: "var(--color-rule)", borderRadius: 99, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-ink)", marginBottom: 6 }}>🧴 Confirm Your Supplies</div>
            <div style={{ fontSize: 14, color: "var(--color-ink-mid)", marginBottom: 20, lineHeight: 1.5 }}>To qualify for the $10 discount, please confirm you have all of the following available for our cleaner:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[["🧹","All-purpose cleaner"],["🚽","Bathroom disinfectant"],["🪟","Glass cleaner"],["🪣","Mop & bucket"],["🧹","Vacuum cleaner"],["🪥","Toilet brush"],["🧽","Towels & sponges"],["🧹","Broom & dustpan"]].map(([icon,item]) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-surface)", border: "1.5px solid var(--color-surface-mid)", borderRadius: 10, padding: "12px 14px", fontSize: 14, fontWeight: 500 }}>
                  <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{icon}</span>{item}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setState((s: BookingState) => { const a = new Set(s.addons); a.add("ownsupplies"); return { ...s, addons: a }; }); setShowSuppliesModal(false); }} style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", border: "none", borderRadius: 50, padding: 15, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(29,127,232,0.30)" }}>
                ✅ Yes, I have all of these — Apply $10 Off
              </button>
              <button onClick={() => setShowSuppliesModal(false)} style={{ background: "none", border: "2px solid var(--color-rule)", borderRadius: 50, padding: 13, fontSize: 15, fontWeight: 600, color: "var(--color-ink-mid)", cursor: "pointer" }}>
                I don't have everything — Skip discount
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Step4({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <>
      <StepHeader eyebrow="Step 4 — Frequency" title="How often should we visit?" sub="Recurring plans save you money on every visit." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {FREQUENCIES.map(f => {
          const sel = state.frequency === f.id;
          return (
            <div key={f.id} onClick={() => update({ frequency: f.id })} style={{ background: sel ? "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)" : "white", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 16, padding: "20px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.2s", position: "relative", boxShadow: sel ? "0 6px 24px rgba(29,127,232,0.35)" : "none" }}>
              {f.discount && <div style={{ display: "inline-block", background: "#FFD700", color: "#7A5700", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, marginBottom: 8, letterSpacing: "0.3px" }}>{f.discount}</div>}
              {!f.discount && <div style={{ height: 20 }} />}
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: sel ? "white" : "var(--color-ink)" }}>{f.name}</div>
              <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.4, color: sel ? "white" : "var(--color-ink-mid)" }}>{f.desc}</div>
              {f.discount && <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700", marginTop: 8 }}>{f.discount}</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Step5({ state, update, calYear, calMonth, setCalYear, setCalMonth }: any) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  function prevMonth() { if (calMonth === 0) { setCalMonth(11); setCalYear((y: number) => y - 1); } else setCalMonth((m: number) => m - 1); }
  function nextMonth() { if (calMonth === 11) { setCalMonth(0); setCalYear((y: number) => y + 1); } else setCalMonth((m: number) => m + 1); }

  return (
    <>
      <StepHeader eyebrow="Step 5 — Schedule" title="Pick your date & time" sub="Select any available date — we'll confirm within 2 hours." />
      <div style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-soft)" }}>
        <div style={{ background: "var(--color-accent)", color: "white", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={prevMonth} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{months[calMonth]} {calYear}</div>
          <button onClick={nextMonth} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 4px 8px" }}>
          {days.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--color-muted)", padding: "10px 4px 6px", letterSpacing: "0.5px" }}>{d}</div>)}
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const date = new Date(calYear, calMonth, d);
            const isPast = date < today;
            const isSel = state.date === dateStr;
            const isToday = date.getTime() === today.getTime();
            return (
              <div key={d} onClick={() => !isPast && update({ date: dateStr })} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: isPast ? "not-allowed" : "pointer", borderRadius: "50%", margin: 3, fontWeight: 500, background: isSel ? "var(--color-accent)" : "transparent", color: isPast ? "var(--color-rule)" : isSel ? "white" : "var(--color-ink)", border: isToday && !isSel ? "2px solid var(--color-accent-light)" : "2px solid transparent", boxShadow: isSel ? "0 2px 8px rgba(29,127,232,0.4)" : "none", transition: "all 0.15s" }}>
                {d}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-mid)", marginBottom: 10 }}>Available arrival windows:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {TIME_SLOTS.map(t => {
            const sel = state.time === t;
            return (
              <div key={t} onClick={() => update({ time: t })} style={{ background: sel ? "var(--color-accent)" : "white", border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 10, padding: "10px 6px", textAlign: "center", cursor: "pointer", fontSize: 13, fontWeight: 600, color: sel ? "white" : "var(--color-ink)", transition: "all 0.15s" }}>
                {t}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Step6({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  function useGPS() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const d = await r.json();
        const addr = d.address || {};
        update({ address: ((addr.house_number || "") + " " + (addr.road || "")).trim(), city: addr.city || addr.town || addr.village || "Atlanta", zip: addr.postcode || "" });
      } catch {}
    });
  }

  return (
    <>
      <StepHeader eyebrow="Step 6 — Address" title="Where should we go?" sub="We serve Atlanta & Metro Atlanta only." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-surface)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--color-accent-mid)", fontWeight: 500 }}>
          📍 Service area: Atlanta, Buckhead, Midtown, Decatur, Sandy Springs, Alpharetta, Marietta, Smyrna & more.
        </div>
        <button onClick={useGPS} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-surface)", color: "var(--color-accent)", border: "2px solid var(--color-surface-mid)", borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          📡 Use My Current Location
        </button>
        <TextInput label="Street Address" placeholder="123 Peachtree St NW" value={state.address} onChange={v => update({ address: v })} required />
        <TextInput label="Apt / Suite / Unit (optional)" placeholder="Apt 4B" value={state.apt} onChange={v => update({ apt: v })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput label="City" placeholder="Atlanta" value={state.city} onChange={v => update({ city: v })} />
          <TextInput label="ZIP Code" placeholder="30308" value={state.zip} onChange={v => update({ zip: v.replace(/\D/g,"").slice(0,5) })} inputMode="numeric" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-mid)" }}>State</label>
          <select value={state.stateCode} onChange={e => update({ stateCode: e.target.value })} style={{ width: "100%", padding: "13px 14px", border: "2px solid var(--color-rule)", borderRadius: 10, fontSize: 15, color: "var(--color-ink)", background: "white", outline: "none" }}>
            <option value="GA">Georgia (GA)</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-mid)" }}>Special Instructions (optional)</label>
          <textarea value={state.specialInstructions} onChange={e => update({ specialInstructions: e.target.value })} placeholder="Gate code, pet info, parking notes…" rows={3} style={{ width: "100%", padding: "12px 14px", border: "2px solid var(--color-rule)", borderRadius: 10, fontSize: 15, color: "var(--color-ink)", background: "white", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
        </div>
      </div>
    </>
  );
}

function Step7({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <>
      <StepHeader eyebrow="Step 7 — Contact" title="Who should we contact?" sub="We'll send your confirmation and updates here." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput label="First Name" placeholder="Jane" value={state.firstName} onChange={v => update({ firstName: v })} autoComplete="given-name" />
          <TextInput label="Last Name" placeholder="Smith" value={state.lastName} onChange={v => update({ lastName: v })} autoComplete="family-name" />
        </div>
        <TextInput label="Email Address" placeholder="jane@email.com" value={state.email} onChange={v => update({ email: v })} type="email" autoComplete="email" />
        <TextInput label="Phone Number" placeholder="(404) 555-0123" value={state.phone} onChange={v => update({ phone: v })} type="tel" inputMode="tel" autoComplete="tel" />
      </div>
    </>
  );
}

function Step8({ state, update, calcTotal }: { state: BookingState; update: (p: Partial<BookingState>) => void; calcTotal: () => number }) {
  return (
    <>
      <StepHeader eyebrow="Step 8 — Payment" title="Payment details" sub="A pre-authorization hold is placed on your card at booking. You are fully charged only after your cleaning is complete." />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-surface-mid)", borderRadius: 16, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Order Summary</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Total Due After Service</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)" }}>${calcTotal()}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#15803d", fontWeight: 600 }}>
          🔒 Secure checkout — 256-bit encrypted. You won't be charged until service is complete.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["card","💳","Credit / Debit Card"],["applepay","🍎","Apple Pay"],["googlepay","🅖","Google Pay"],["cashapp","💵","Cash App Pay"]].map(([id,icon,label]) => {
            const sel = state.payMethod === id;
            return (
              <div key={id} onClick={() => update({ payMethod: id as PayMethod })} style={{ border: `2px solid ${sel ? "var(--color-accent)" : "var(--color-rule)"}`, borderRadius: 10, padding: 14, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600, color: sel ? "var(--color-accent)" : "var(--color-ink-mid)", background: sel ? "var(--color-surface)" : "white", display: "flex", flexDirection: "column", gap: 6, alignItems: "center", transition: "all 0.15s" }}>
                <span style={{ fontSize: 22 }}>{icon}</span>{label}
              </div>
            );
          })}
        </div>

        {state.payMethod === "card" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TextInput label="Cardholder Name" placeholder="Jane Smith" value={state.cardName} onChange={v => update({ cardName: v })} autoComplete="cc-name" />
            <TextInput label="Card Number" placeholder="1234 5678 9012 3456" value={state.cardNum} onChange={v => update({ cardNum: v.replace(/\D/g,"").slice(0,16) })} inputMode="numeric" autoComplete="cc-number" maxLength={19} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <TextInput label="Expiration" placeholder="MM/YY" value={state.cardExp} onChange={v => { let x = v.replace(/\D/g,"").slice(0,4); if (x.length >= 2) x = x.slice(0,2) + "/" + x.slice(2); update({ cardExp: x }); }} maxLength={5} />
              <TextInput label="CVV" placeholder="•••" value={state.cardCvv} onChange={v => update({ cardCvv: v.replace(/\D/g,"").slice(0,4) })} inputMode="numeric" maxLength={4} />
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--color-surface)", borderRadius: 16, padding: 32, textAlign: "center", border: "1.5px dashed var(--color-surface-mid)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{state.payMethod === "applepay" ? "🍎" : state.payMethod === "googlepay" ? "🅖" : "💵"}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink-mid)" }}>You'll be redirected to complete payment securely after confirming your booking.</div>
          </div>
        )}

        <div style={{ fontSize: 11, color: "var(--color-muted)", textAlign: "center", padding: "4px 0" }}>
          By completing your booking you agree to our <Link href="/terms" style={{ color: "var(--color-accent)" }}>Terms of Service</Link> & <Link href="/privacy" style={{ color: "var(--color-accent)" }}>Privacy Policy</Link>.
        </div>
      </div>
    </>
  );
}

function Step9({ state, calcTotal, goToStep }: { state: BookingState; calcTotal: () => number; goToStep: (n: number) => void }) {
  const svc = SERVICES.find(s => s.id === state.service);
  const freq = FREQUENCIES.find(f => f.id === state.frequency);
  const addonList = [...state.addons].map(id => ADDONS.find(a => a.id === id)?.name).filter(Boolean).join(", ");
  const disc = FREQ_DISCOUNTS[state.frequency];
  const dateStr = state.date ? new Date(state.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Not selected";

  return (
    <>
      <StepHeader eyebrow="Step 9 — Review" title="Review your booking" sub="Double check everything before we confirm your cleaning." />
      <div style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-soft)" }}>
        <div style={{ padding: 20 }}>
          <SummaryRow label="Service" value={svc?.name || "—"} />
          <SummaryRow label="Home Size" value={`${state.bedrooms} bed · ${state.bathrooms} bath${state.halfBaths > 0 ? ` · ${state.halfBaths} half` : ""}`} />
          {addonList && <SummaryRow label="Add-ons" value={addonList} />}
          <SummaryRow label="Frequency" value={`${freq?.name || "—"}${disc > 0 ? ` (${disc * 100}% off)` : ""}`} />
          <SummaryRow label="Date" value={dateStr} />
          <SummaryRow label="Arrival" value={state.time || "—"} />
          <SummaryRow label="Address" value={`${state.address}${state.apt ? ", " + state.apt : ""}, ${state.city}, ${state.stateCode} ${state.zip}`} />
          <SummaryRow label="Contact" value={`${state.firstName} ${state.lastName} · ${state.phone}`} />
          <SummaryRow label="Payment" value={state.payMethod === "card" ? `•••• ${state.cardNum.slice(-4) || "????"}` : state.payMethod} />
          <div style={{ background: "var(--color-surface)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Total Due After Service</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-accent)" }}>${calcTotal()}</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => goToStep(1)} style={{ background: "none", border: "2px solid var(--color-rule)", borderRadius: 50, padding: 14, fontSize: 15, fontWeight: 600, color: "var(--color-ink-mid)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>Edit Booking</button>
      </div>
    </>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────

function AppHeader() {
  return (
    <header style={{ background: "white", borderBottom: "1px solid var(--color-rule)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 12px rgba(29,127,232,0.07)" }}>
      <BubbleLogo size={44} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-accent-deep)", letterSpacing: "-0.3px" }}>BubbleBox ATL</div>
        <div style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 500 }}>Atlanta's #1 Cleaning Service</div>
      </div>
    </header>
  );
}

function StepHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 6 }}>{eyebrow}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "var(--color-ink)", lineHeight: 1.2, letterSpacing: "-0.5px" }}>{title}</div>
      <div style={{ fontSize: 14, color: "var(--color-ink-mid)", marginTop: 6, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function TextInput({ label, placeholder, value, onChange, type = "text", inputMode, autoComplete, required, maxLength }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-mid)" }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        inputMode={inputMode} autoComplete={autoComplete} required={required} maxLength={maxLength}
        style={{ width: "100%", padding: "13px 14px", border: "2px solid var(--color-rule)", borderRadius: 10, fontSize: 15, color: "var(--color-ink)", background: "white", outline: "none", WebkitAppearance: "none", transition: "border-color 0.15s" }}
        onFocus={e => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(29,127,232,0.12)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--color-rule)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--color-surface-mid)", gap: 12 }}>
      <dt style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>{label}</dt>
      <dd style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)", textAlign: "right" }}>{value}</dd>
    </div>
  );
}

const btnNext: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)",
  color: "white", border: "none", borderRadius: 50, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(29,127,232,0.35)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
};

const btnPrimary: React.CSSProperties = {
  width: "100%", maxWidth: 320, background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", border: "none", borderRadius: 50, padding: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(29,127,232,0.35)",
};
