import { Header, Footer } from "@/components/Chrome";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-20">
        <h1
          className="text-4xl leading-tight md:text-5xl"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-ink)",
          }}
        >
          {title}
        </h1>
        <p
          className="mt-3 border-b pb-6 text-sm"
          style={{ borderColor: "var(--color-rule)", color: "var(--color-muted)" }}
        >
          Last updated: {updated}
        </p>
        <article className="legal-prose mt-8">{children}</article>
      </main>
      <Footer />
      <style>{`
        .legal-prose { color: var(--color-ink); line-height: 1.7; }
        .legal-prose h2 {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 1.6rem;
          margin-top: 3rem;
          margin-bottom: 1rem;
        }
        .legal-prose p { margin-bottom: 1.25rem; }
        .legal-prose ul { margin: 0 0 1.25rem 1.5rem; }
        .legal-prose li { margin-bottom: 0.5rem; }
        .legal-prose strong { font-weight: 600; }
        .legal-prose a {
          color: var(--color-accent-deep);
          text-decoration: underline;
        }
        .callout {
          background: var(--color-surface);
          padding: 1.5rem 1.75rem;
          border-radius: 0.5rem;
          border-left: 3px solid var(--color-accent);
          margin: 1.5rem 0 2rem;
        }
        .callout p:last-child { margin-bottom: 0; }
      `}</style>
    </>
  );
}
