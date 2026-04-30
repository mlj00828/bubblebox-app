import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description:
    "BubbleBox Terms of Service governing the use of the BubbleBox cleaning marketplace by customers and cleaning professionals.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="April 28, 2026">
      <p>
        These Terms of Service ("Terms") govern your use of the BubbleBox
        cleaning marketplace ("BubbleBox," "we," "our," or "us"), accessible
        at homeproatl.xyz. By accessing or using BubbleBox, you agree to be
        bound by these Terms.
      </p>

      <h2>1. Overview of the Service</h2>
      <p>
        BubbleBox is a marketplace that connects customers seeking cleaning
        services with independent cleaning professionals ("pros") in the
        Atlanta metropolitan area. BubbleBox is not a cleaning company. Pros
        are independent contractors and not employees of BubbleBox.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and legally able to enter into
        binding contracts to use BubbleBox. By using BubbleBox, you represent
        and warrant that you meet these requirements.
      </p>

      <h2>3. Customer Bookings</h2>
      <p>When you book a cleaning through BubbleBox, you agree to:</p>
      <ul>
        <li>Provide accurate information about the property and cleaning needs.</li>
        <li>Be available to grant the assigned pro access to the property at the scheduled time.</li>
        <li>Pay the disclosed price for the service.</li>
        <li>Treat the assigned pro with respect and provide a safe working environment.</li>
      </ul>

      <h2>4. Pro Obligations</h2>
      <p>Cleaning professionals using BubbleBox agree to:</p>
      <ul>
        <li>Provide cleaning services in a professional manner consistent with industry standards.</li>
        <li>Arrive at scheduled appointments on time.</li>
        <li>Carry appropriate insurance for their work (recommended).</li>
        <li>Treat customers and their property with respect and care.</li>
        <li>Comply with all applicable laws and tax obligations as independent contractors.</li>
      </ul>

      <h2>5. Payment</h2>
      <p>
        Payments are processed by Stripe. BubbleBox collects payment from the
        customer at the time of booking or after job completion (depending on
        the booking type). BubbleBox retains a service fee, and the remaining
        amount is paid to the assigned pro after the job is completed and
        confirmed.
      </p>

      <h2>6. Cancellations and Refunds</h2>
      <p>
        Customers may cancel a booking up to 24 hours before the scheduled
        start time for a full refund. Cancellations made less than 24 hours in
        advance may incur a fee. Pros who repeatedly cancel accepted jobs may
        be removed from the BubbleBox platform.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        BubbleBox provides the marketplace platform on an "as is" basis. While
        we vet pros to the best of our ability, BubbleBox is not liable for
        the acts or omissions of pros, customers, or third parties. To the
        fullest extent permitted by law, BubbleBox's total liability arising
        from these Terms is limited to the amount paid by the affected party
        in the 30 days prior to the event giving rise to the claim.
      </p>

      <h2>8. Disputes</h2>
      <p>
        If you have a complaint about a pro or a customer, contact us at{" "}
        <a href="mailto:bubbleboxusa@gmail.com">bubbleboxusa@gmail.com</a>.
        BubbleBox will investigate and may issue refunds, credits, or platform
        actions at its discretion.
      </p>

      <h2>9. Termination</h2>
      <p>
        BubbleBox may suspend or terminate your access to the platform at any
        time, with or without notice, for any reason — including violations
        of these Terms.
      </p>

      <h2>10. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Changes will be posted at
        this URL with an updated "Last updated" date. Continued use of
        BubbleBox after changes constitutes acceptance of the new Terms.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of Georgia, without
        regard to its conflict of laws provisions.
      </p>

      <h2>12. Contact</h2>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:bubbleboxusa@gmail.com">bubbleboxusa@gmail.com</a>
        <br />
        <strong>Phone:</strong> +1 (678) 820-4881
        <br />
        <strong>Mail:</strong> BubbleBox · Atlanta, GA
      </p>
    </LegalPage>
  );
}
