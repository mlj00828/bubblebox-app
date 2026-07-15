import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "BubbleBox privacy policy explaining what personal data we collect, how we use it, who we share it with, and your rights.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="April 28, 2026">
      <p>
        BubbleBox ("we," "our," or "us") respects your privacy. This Privacy
        Policy explains what personal information we collect, how we use it,
        and the choices you have regarding your information when you use
        BubbleBox to book or provide cleaning services.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect the following categories of personal information:</p>
      <ul>
        <li><strong>Identity and contact information:</strong> name, email address, mobile phone number.</li>
        <li><strong>Booking information:</strong> service address, ZIP code, scheduled date and time, type of cleaning requested, special instructions.</li>
        <li><strong>Payment information:</strong> processed by our payment provider (Stripe). We do not store full card numbers on our servers.</li>
        <li><strong>Pro information:</strong> for cleaning professionals, additional information including service area, availability, and qualifications.</li>
        <li><strong>Communications:</strong> SMS and email messages exchanged through our platform.</li>
        <li><strong>Technical information:</strong> IP address, browser type, and basic usage analytics.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Match customers with cleaning professionals in their service area.</li>
        <li>Process bookings, payments, and refunds.</li>
        <li>Send SMS messages and emails about your bookings, including offers, confirmations, reminders, and receipts (see our <a href="/sms-terms">SMS Terms</a> for details).</li>
        <li>Resolve disputes between customers and pros.</li>
        <li>Improve our services and develop new features.</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>We share your information in limited circumstances:</p>
      <ul>
        <li><strong>Between matched customers and pros:</strong> when a pro accepts a job, we share the customer's name, address, and phone number with the assigned pro for the purpose of completing the cleaning. Likewise, the pro's name and phone number are shared with the customer.</li>
        <li><strong>Service providers:</strong> we use Twilio for SMS delivery, Stripe for payment processing, Resend for email delivery, and Oracle Cloud for hosting. These providers process your data only as needed to provide their services to BubbleBox.</li>
        <li><strong>Legal compliance:</strong> we may disclose information if required by law, court order, or government request.</li>
        <li><strong>Business transfers:</strong> if BubbleBox is acquired or merges with another company, your information may be transferred as part of that transaction.</li>
      </ul>
      <p>
        We do not sell your personal information. We do not share your phone
        number or email with third parties for marketing purposes.
      </p>

      <h2>4. Data Retention</h2>
      <p>
        We retain your information for as long as you have an active BubbleBox
        account, plus a reasonable period thereafter to comply with legal
        obligations, resolve disputes, and enforce our agreements. Booking
        records are typically retained for seven years for tax and accounting
        purposes.
      </p>

      <h2>5. Security</h2>
      <p>
        We use industry-standard technical and organizational measures to
        protect your information, including encryption in transit (HTTPS/TLS)
        and at rest, access controls, and regular security reviews. No system
        is perfectly secure, however, and we cannot guarantee the absolute
        security of your information.
      </p>

      <h2>6. Your Rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you.</li>
        <li>Request correction or deletion of your information.</li>
        <li>Object to or restrict certain processing of your information.</li>
        <li>Receive a copy of your information in a portable format.</li>
        <li>Withdraw consent (such as opting out of SMS messages by replying STOP).</li>
      </ul>
      <p>
        To exercise these rights, contact us at{" "}
        <a href="mailto:hello@bubbleboxatl.com">hello@bubbleboxatl.com</a>.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        BubbleBox is not directed at children under the age of 13. We do not
        knowingly collect personal information from children. If you believe
        a child has provided information to us, please contact us at{" "}
        <a href="mailto:hello@bubbleboxatl.com">hello@bubbleboxatl.com</a>{" "}
        and we will delete it.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be
        posted at this URL with an updated "Last updated" date. We will notify
        you of material changes via SMS or email when possible.
      </p>

      <h2>9. Contact Us</h2>
      <p>Questions about this Privacy Policy?</p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:hello@bubbleboxatl.com">hello@bubbleboxatl.com</a>
        <br />
        <strong>Phone:</strong> +1 (678) 820-4881
        <br />
        <strong>Mail:</strong> BubbleBox · Atlanta, GA
      </p>
    </LegalPage>
  );
}
