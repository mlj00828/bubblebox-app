"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";
import { SERVICES, formatPrice } from "@/lib/services";
import { isInServiceArea } from "@/lib/service-area";

const S = {
  // inline style helpers
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, color: "var(--color-accent)", marginBottom: 10 },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 42px)", lineHeight: 1.15, letterSpacing: "-0.5px", color: "var(--color-ink)", marginBottom: 12 },
  sectionSub: { fontSize: 16, color: "var(--color-ink-mid)", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 },
};

export default function Home() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  function handleZip() {
    const z = zip.trim();
    if (z.length !== 5) { setZipError("Enter a 5-digit ZIP code"); return; }
    if (!isInServiceArea(z)) { setZipError(`We don't serve ${z} yet — contact us and we'll let you know when we expand.`); return; }
    setZipError("");
    router.push(`/book?zip=${z}`);
  }

  return (
    <>
      <Header />

      {/* ── PROMO BANNER ── */}
      <div style={{ background: "linear-gradient(90deg, var(--color-accent-deep) 0%, var(--color-accent) 100%)", color: "white", textAlign: "center", padding: "10px 20px", fontSize: 14, fontWeight: 600 }}>
        🧹 First-time customers get <span style={{ color: "#FFD700" }}>$20 OFF</span> — Use code <span style={{ color: "#FFD700" }}>BUBBLE20</span> at checkout!
      </div>

      <main>
        {/* ── HERO ── */}
        <section style={{ background: "var(--color-white)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", minHeight: 560 }} className="hero-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-surface)", border: "1px solid var(--color-surface-mid)", borderRadius: 99, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "var(--color-accent-mid)", width: "fit-content" }}>
                <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
                Available Today in Atlanta
              </div>

              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.1, color: "var(--color-ink)", letterSpacing: "-1px" }}>
                A <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>sparkling clean</em><br />home, on your schedule.
              </h1>

              <p style={{ fontSize: 17, color: "var(--color-ink-mid)", lineHeight: 1.6, maxWidth: 440 }}>
                Professional, background-checked cleaners serving Atlanta & Metro Atlanta. Book online in 60 seconds. Satisfaction guaranteed or we come back free.
              </p>

              {/* ZIP widget */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-ink-mid)", marginBottom: 8 }}>
                  Enter your ZIP to get started:
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    type="text" inputMode="numeric" maxLength={5} value={zip}
                    onChange={e => { setZip(e.target.value.replace(/\D/g,"").slice(0,5)); setZipError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleZip()}
                    placeholder="30309"
                    style={{ width: 120, padding: "14px 16px", border: `2px solid ${zipError ? "var(--color-danger)" : "var(--color-rule)"}`, borderRadius: 12, fontSize: 17, fontWeight: 700, color: "var(--color-ink)", background: "white", outline: "none" }}
                  />
                  <button onClick={handleZip} style={{ background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", color: "white", border: "none", borderRadius: 50, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 24px rgba(29,127,232,0.35)", transition: "all 0.2s" }}>
                    Book a Cleaning →
                  </button>
                </div>
                {zipError && <p style={{ marginTop: 8, fontSize: 13, color: "var(--color-danger)", fontWeight: 500 }}>{zipError}</p>}
              </div>

              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                {[["1,200+","Cleanings done"],["4.9★","Average rating"],["$99","Starting price"]].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.5px" }}>{n}</div>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 500 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 480, aspectRatio: "1", borderRadius: 32, background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-mid) 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
                <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(29,127,232,0.08)", top: -40, right: -40 }} />
                <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(29,127,232,0.06)", bottom: -20, left: -20 }} />
                <div style={{ textAlign: "center", padding: 24, position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 16, filter: "drop-shadow(0 4px 12px rgba(29,127,232,0.3))" }}>🫧</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-accent-deep)", marginBottom: 6 }}>Professional Cleaning</div>
                  <div style={{ fontSize: 13, color: "var(--color-muted)" }}>Atlanta & Metro Area</div>
                </div>
              </div>
              <FloatBadge style={{ bottom: 24, left: -20 }}>✅ Booking confirmed!</FloatBadge>
              <FloatBadge style={{ top: 32, right: -16, animationDelay: "1s" }}>⭐ 5-star rated</FloatBadge>
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ── */}
        <div style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-rule)", borderBottom: "1px solid var(--color-rule)", padding: "18px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["✅ Background-checked cleaners","💯 Satisfaction guarantee","⚡ Same-day booking","🌿 Eco-friendly products","⭐ 4.9-star rated"].map(t => (
              <span key={t} style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-mid)", whiteSpace: "nowrap" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── WHAT'S INCLUDED ── */}
        <section style={{ padding: "80px 24px", background: "var(--color-white)" }} id="included">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={S.eyebrow}>What's Included</div>
              <h2 style={S.sectionTitle}>Every cleaning includes all of this</h2>
              <p style={S.sectionSub}>Our standard cleaning covers every room — no hidden extras, no cutting corners.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }} className="included-grid">
              {INCLUDED_ROOMS.map((room, i) => (
                <div key={room.title} style={{ background: room.extra ? "var(--color-surface)" : "white", border: `1.5px solid ${room.extra ? "var(--color-surface-mid)" : "var(--color-rule)"}`, borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 28 }}>{room.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-ink)" }}>{room.title}</h3>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {room.items.map(item => (
                      <li key={item} style={{ fontSize: 13, color: "var(--color-ink-mid)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4 }}>
                        <span style={{ color: room.extra ? "var(--color-accent-mid)" : "var(--color-accent)", fontWeight: 700, flexShrink: 0 }}>{room.extra ? "+" : "✓"}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {room.extra && <Link href="/book" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "var(--color-accent)", textDecoration: "none", marginTop: 4 }}>See all add-ons →</Link>}
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", background: "var(--color-surface)", border: "1.5px solid var(--color-surface-mid)", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "var(--color-accent-mid)" }}>
              ✅ All supplies & equipment included — or save $10 by providing your own!
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: "80px 24px", background: "var(--color-paper)" }} id="how">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={S.eyebrow}>Simple & Fast</div>
              <h2 style={S.sectionTitle}>How BubbleBox works</h2>
              <p style={S.sectionSub}>Book your cleaning in under a minute. We handle the rest.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative" }} className="steps-grid">
              {[["1","Book Online","Choose your service, pick a date & time, and enter your address. Takes less than 60 seconds."],
                ["2","We Show Up","Your background-checked, professional cleaner arrives on time with all supplies included."],
                ["3","Enjoy a Clean Home","Relax while we do the work. Not happy? We come back for free — no questions asked."]
              ].map(([n,title,desc]) => (
                <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, position: "relative", zIndex: 1 }}>
                  <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "white", boxShadow: "0 6px 20px rgba(29,127,232,0.35)", flexShrink: 0 }}>{n}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "var(--color-ink-mid)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section style={{ padding: "80px 24px", background: "var(--color-white)" }} id="services">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={S.eyebrow}>Our Services</div>
              <h2 style={S.sectionTitle}>Every type of clean, covered</h2>
              <p style={S.sectionSub}>Residential, short-term rental, and commercial cleaning across Metro Atlanta.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="services-grid">
              {SERVICES.map(s => (
                <Link key={s.id} href={`/book?service=${s.id}`} style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: "inherit", position: "relative", overflow: "hidden", transition: "all 0.2s" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.boxShadow = "var(--shadow-card)"; el.style.transform = "translateY(-3px)"; el.style.borderColor = "var(--color-surface-mid)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.boxShadow = "none"; el.style.transform = "none"; el.style.borderColor = "var(--color-rule)"; }}
                >
                  <div style={{ fontSize: 36 }}>{s.icon}</div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: "var(--color-ink-mid)", lineHeight: 1.5, flex: 1 }}>{s.longDescription}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)", letterSpacing: "-0.5px" }}>{formatPrice(s.basePriceCents)}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-muted)" }}> / visit</span></div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", display: "flex", alignItems: "center", gap: 6 }}>Book now →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING (dark) ── */}
        <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, var(--color-accent-deep) 0%, var(--color-accent-mid) 100%)" }} id="pricing">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ ...S.eyebrow, color: "var(--color-accent-light)" }}>Transparent Pricing</div>
              <h2 style={{ ...S.sectionTitle, color: "white" }}>Honest prices, no surprises</h2>
              <p style={{ ...S.sectionSub, color: "rgba(255,255,255,0.7)" }}>All prices are starting rates for a 1-bedroom home. Your quote updates live as you book.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="pricing-grid">
              {PRICING_CARDS.map(p => (
                <div key={p.name} style={{ background: p.featured ? "white" : "rgba(255,255,255,0.10)", border: `1px solid ${p.featured ? "white" : "rgba(255,255,255,0.20)"}`, borderRadius: 16, padding: "28px 24px", textAlign: "center", transition: "all 0.2s", position: "relative" }}>
                  {p.featured && <div style={{ display: "inline-block", background: "#FFD700", color: "#7A5700", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, marginBottom: 12 }}>Most Popular</div>}
                  <div style={{ fontSize: 16, fontWeight: 700, color: p.featured ? "var(--color-accent-deep)" : "rgba(255,255,255,0.9)", marginBottom: 8 }}>{p.name}</div>
                  <div style={{ fontSize: 44, fontWeight: 800, color: p.featured ? "var(--color-accent)" : "white", letterSpacing: "-1px", lineHeight: 1 }}>{p.price}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.7, color: p.featured ? "var(--color-ink-mid)" : "white", marginBottom: 0 }}>starting price</div>
                  <p style={{ fontSize: 13, color: p.featured ? "var(--color-ink-mid)" : "rgba(255,255,255,0.65)", margin: "10px 0 20px", lineHeight: 1.5 }}>{p.desc}</p>
                  <Link href="/book" style={{ display: "block", background: p.featured ? "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)" : "rgba(255,255,255,0.15)", color: p.featured ? "white" : "white", border: p.featured ? "none" : "1px solid rgba(255,255,255,0.3)", borderRadius: 50, padding: 12, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.15s" }}>Book {p.name.split(" ")[0]} →</Link>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              💡 Prices increase slightly with additional bedrooms, bathrooms, and add-ons. Your live quote updates as you book.
            </p>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section style={{ padding: "80px 24px", background: "var(--color-white)" }} id="reviews">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={S.eyebrow}>Customer Reviews</div>
              <h2 style={S.sectionTitle}>Atlanta loves BubbleBox</h2>
              <p style={S.sectionSub}>Over 1,200 five-star cleanings across Metro Atlanta.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="reviews-grid">
              {REVIEWS.map(r => (
                <div key={r.name} style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-soft)" }}>
                  <div style={{ color: "#F59E0B", fontSize: 16, letterSpacing: 1 }}>{"★★★★★".slice(0, r.stars)}</div>
                  <p style={{ fontSize: 14, color: "var(--color-ink-mid)", lineHeight: 1.65, fontStyle: "italic", flex: 1 }}>"{r.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-mid) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>{r.initials}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{r.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICE AREA ── */}
        <section style={{ padding: "80px 24px", background: "var(--color-paper)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={S.eyebrow}>Service Area</div>
              <h2 style={S.sectionTitle}>We cover Atlanta & Metro</h2>
              <p style={S.sectionSub}>Serving the entire Atlanta metro area. Don't see your city? Call us.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="area-grid">
              <div style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-rule)", borderRadius: 16, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative", boxShadow: "var(--shadow-card)" }}>
                🗺️
                <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--color-ink-mid)" }}>Atlanta & Metro Atlanta, GA</div>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "var(--color-ink)" }}>Cities we serve:</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {CITIES.map(c => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "var(--color-ink-mid)", padding: "10px 14px", background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 10 }}>
                      <div style={{ width: 8, height: 8, background: "var(--color-accent)", borderRadius: "50%", flexShrink: 0 }} />{c}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--color-surface)", borderRadius: 10, fontSize: 14, color: "var(--color-accent-mid)", fontWeight: 500 }}>
                  📍 Not sure if we cover your area? <a href="tel:+16788204881" style={{ color: "var(--color-accent)", fontWeight: 700, textDecoration: "none" }}>Call or text us</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: "80px 24px", background: "var(--color-white)" }} id="faq">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={S.eyebrow}>FAQ</div>
              <h2 style={S.sectionTitle}>Questions? We've got answers.</h2>
              <p style={S.sectionSub}>Everything you need to know about booking with BubbleBox ATL.</p>
            </div>
            <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ background: "white", border: "1.5px solid var(--color-rule)", borderRadius: 10, overflow: "hidden" }}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", cursor: "pointer", fontSize: 15, fontWeight: 600, gap: 12, width: "100%", background: faqOpen === i ? "var(--color-surface)" : "transparent", textAlign: "left", color: "var(--color-ink)", border: "none", transition: "background 0.15s" }}>
                    {faq.q}
                    <span style={{ fontSize: 18, color: "var(--color-accent)", transition: "transform 0.25s", transform: faqOpen === i ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>⌄</span>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding: "0 20px 18px", fontSize: 14, color: "var(--color-ink-mid)", lineHeight: 1.65 }}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <div style={{ background: "linear-gradient(135deg, var(--color-accent-deep) 0%, var(--color-accent) 100%)", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 44px)", color: "white", marginBottom: 12, letterSpacing: "-0.5px" }}>Ready for a cleaner home?</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", marginBottom: 32, lineHeight: 1.6 }}>Book in 60 seconds. Professional cleaners serving Atlanta & Metro Atlanta. First booking gets $20 off.</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/book" style={{ background: "white", color: "var(--color-accent-deep)", border: "none", borderRadius: 50, padding: "16px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.2s" }}>Book Now — From $99 →</Link>
              <a href="tel:+16788204881" style={{ background: "transparent", color: "white", border: "2px solid rgba(255,255,255,0.5)", borderRadius: 50, padding: "16px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}>📞 Call Us</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important;gap:32px!important;padding:40px 20px 32px!important;min-height:auto!important}
          .included-grid{grid-template-columns:repeat(2,1fr)!important}
          .steps-grid{grid-template-columns:1fr!important;gap:24px!important}
          .services-grid{grid-template-columns:repeat(2,1fr)!important}
          .pricing-grid{grid-template-columns:repeat(2,1fr)!important}
          .reviews-grid{grid-template-columns:repeat(2,1fr)!important}
          .area-grid{grid-template-columns:1fr!important;gap:24px!important}
        }
        @media(max-width:560px){
          .included-grid{grid-template-columns:1fr!important}
          .services-grid{grid-template-columns:1fr!important}
          .pricing-grid{grid-template-columns:1fr!important}
          .reviews-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </>
  );
}

function FloatBadge({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", background: "white", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(29,127,232,0.18)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "var(--color-ink)", whiteSpace: "nowrap", animation: "floatUp 3s ease-in-out infinite", ...style }}>
      {children}
    </div>
  );
}

const INCLUDED_ROOMS = [
  { icon: "🍳", title: "Kitchen", items: ["Countertops wiped & disinfected","Stovetop & burners cleaned","Exterior of appliances cleaned","Microwave interior & exterior","Sink scrubbed & polished","Cabinet fronts wiped down","Trash emptied & relined","Floor swept & mopped"] },
  { icon: "🚿", title: "Bathrooms", items: ["Toilet scrubbed inside & out","Shower & tub scrubbed","Tiles & grout cleaned","Sink & faucet polished","Mirror cleaned streak-free","Countertops disinfected","Trash emptied & relined","Floor swept & mopped"] },
  { icon: "🛏️", title: "Bedrooms", items: ["Dust all surfaces & furniture","Mirrors cleaned","Vacuum floors & rugs","Mop hard floors","Closet exterior wiped","Nightstands & dressers dusted","Ceiling fans & light fixtures","Trash emptied & relined"] },
  { icon: "🛋️", title: "Living Areas", items: ["All surfaces dusted","Baseboards wiped","Window sills dusted","Vacuum furniture & cushions","Vacuum & mop floors","Light switches & door handles","Ceiling fans dusted","Trash emptied & relined"] },
  { icon: "🏠", title: "General / Whole Home", items: ["All rooms vacuumed","All hard floors mopped","All mirrors & glass cleaned","Cobwebs removed","Interior doors & frames wiped","Hallways & stairs cleaned","All trash cans emptied","Eco-friendly products available"] },
  { icon: "➕", title: "Available Add-Ons", extra: true, items: ["Inside oven (+$45)","Inside refrigerator (+$35)","Interior windows (+$50)","Laundry wash & dry (+$30)","Inside cabinets (+$40)","Garage sweep (+$60)","Patio / balcony (+$55)","Wall spot cleaning (+$70)"] },
];

const PRICING_CARDS = [
  { name: "Standard Cleaning", price: "$99", desc: "Perfect for weekly or bi-weekly upkeep. Save up to 20% with a recurring plan." },
  { name: "Deep Cleaning", price: "$169", desc: "First-time customers love this. A thorough reset for your home from top to bottom.", featured: true },
  { name: "Airbnb Turnover", price: "$109", desc: "Fast turnaround between guests. Keep your 5-star rating with every stay." },
  { name: "Move In / Move Out", price: "$219", desc: "Get your security deposit back or start fresh in a spotless new home." },
  { name: "Post-Construction", price: "$279", desc: "Heavy-duty clean after construction, remodels, or renovation work." },
  { name: "Office / Commercial", price: "$129", desc: "Professional workspace cleaning — flexible scheduling around your business hours." },
];

const REVIEWS = [
  { name: "Jessica M.", location: "Midtown, Atlanta", initials: "JM", stars: 5, text: "Absolutely incredible. My apartment has never looked this clean. The team was on time, professional, and thorough. Will definitely be booking again!" },
  { name: "David K.", location: "Buckhead, Atlanta", initials: "DK", stars: 5, text: "Used them for my Airbnb and my guests always comment on how clean it is. BubbleBox is the only cleaning service I trust. Booking is so easy too." },
  { name: "Tanya P.", location: "Decatur, GA", initials: "TP", stars: 5, text: "Move-out clean was amazing. The place looked brand new when they were done. BubbleBox is so much more affordable than other companies I called." },
  { name: "Robert H.", location: "Sandy Springs, GA", initials: "RH", stars: 5, text: "I've tried 3 other cleaning services in Atlanta and BubbleBox is by far the best value. Deep clean was worth every penny — my house sparkles!" },
  { name: "Alexis L.", location: "Alpharetta, GA", initials: "AL", stars: 5, text: "Booked same-day online and they were there within hours. The kitchen and bathrooms were spotless. Extremely professional and friendly staff." },
  { name: "Carlos M.", location: "Marietta, GA", initials: "CM", stars: 5, text: "We use BubbleBox for our office every week. The team is reliable, thorough, and always leaves our workspace looking brand new. 10/10!" },
];

const CITIES = ["Atlanta","Buckhead","Midtown","Decatur","Sandy Springs","Alpharetta","Marietta","Smyrna","Roswell","Dunwoody","Brookhaven","East Atlanta","College Park","Norcross","Kennesaw","Peachtree City"];

const FAQS = [
  { q: "Do I need to be home during the cleaning?", a: "No! Many of our customers prefer to be out during their cleaning. You can provide entry instructions (key code, lockbox, etc.) in your booking notes and we'll handle the rest." },
  { q: "Are your cleaners background-checked?", a: "Absolutely. Every BubbleBox cleaner passes a thorough background check before joining our team." },
  { q: "What if I'm not happy with my cleaning?", a: "We offer a 100% satisfaction guarantee. If you're not happy, let us know within 24 hours and we'll send a team back to re-clean the affected areas at no additional cost." },
  { q: "Do you bring your own supplies and equipment?", a: "Yes! Our cleaners arrive fully equipped with professional-grade supplies. Prefer to use your own? Save $10 by selecting \"I'll Provide My Own Supplies\" during booking." },
  { q: "Can I book same-day?", a: "Yes, same-day booking is available based on cleaner availability. Book before noon and we'll do our best to have someone there the same day." },
  { q: "How do recurring plans work?", a: "With a recurring plan (weekly, bi-weekly, or monthly), we lock in a discounted rate for every visit — up to 20% off. You can pause or cancel at any time with no penalty." },
  { q: "When am I charged?", a: "A pre-authorization hold is placed on your card at the time of booking to verify funds are available. This is not a charge. Your card is fully charged only after your cleaning is complete." },
  { q: "How do I use my $20 first-booking discount?", a: "Use promo code BUBBLE20 at checkout during your first booking. The $20 discount will be applied automatically. One use per customer." },
];
