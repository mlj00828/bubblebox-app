import Link from "next/link";
import { Header, Footer } from "@/components/Chrome";

export const metadata = {
  title: "Application received",
};

export default function ThanksPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8 md:py-24">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ background: "var(--color-success)" }}
        >
          ✓
        </div>
        <h1 className="text-3xl font-extrabold md:text-4xl">
          Application received
        </h1>
        <p
          className="mt-4 text-lg"
          style={{ color: "var(--color-muted)" }}
        >
          Thanks for applying to join BubbleBox. We review every application
          within 24–48 hours and will text you next steps — including how to
          submit your driver's license, W-9, and Stripe payout setup.
        </p>

        <div
          className="mx-auto mt-10 max-w-md rounded-2xl p-6 text-left"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-rule)",
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>
            What happens next
          </h2>
          <ol
            className="mt-3 list-decimal space-y-2 pl-5 text-sm"
            style={{ color: "var(--color-ink)" }}
          >
            <li>We review your application (24–48 hours).</li>
            <li>
              We text you with next steps: driver&apos;s license upload, W-9,
              and Stripe payout setup links.
            </li>
            <li>
              Once your background check clears and Stripe is set up, you&apos;re
              live and start receiving job offers via SMS.
            </li>
            <li>
              Reply <strong>YES</strong> to claim a job. We pay daily via Stripe
              after the job is completed.
            </li>
          </ol>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="rounded-full px-6 py-3 font-bold text-white no-underline"
            style={{ background: "var(--color-accent)" }}
          >
            Back to BubbleBox
          </Link>
        </div>

        <p className="mt-8 text-xs" style={{ color: "var(--color-muted)" }}>
          Questions?{" "}
          <a href="mailto:hello@bubbleboxatl.com" className="underline">
            hello@bubbleboxatl.com
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}
