import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "SMS Terms",
  description:
    "BubbleBox SMS messaging terms — consent, opt-out, message frequency, and message and data rate disclosures.",
};

export default function SmsTermsPage() {
  return (
    <LegalPage title="SMS Terms & Conditions" updated="April 28, 2026">
      <p>
        BubbleBox uses SMS text messaging to operate its cleaning marketplace.
        By providing your phone number to BubbleBox — whether as a customer
        booking a cleaning or as a cleaning professional joining our provider
        network — you agree to receive SMS messages from us as described below.
      </p>

      <div className="callout">
        <p>
          <strong>Quick summary:</strong> We will text you about your bookings,
          offers, reminders, and account activity. Reply <strong>STOP</strong>{" "}
          at any time to opt out. Reply <strong>HELP</strong> for help. Message
          and data rates may apply.
        </p>
      </div>

      <h2>1. Program Description</h2>
      <p>
        BubbleBox operates an SMS messaging program to facilitate transactions
        between customers booking cleaning services and independent cleaning
        professionals ("pros") providing those services. Our SMS program
        supports the following message types:
      </p>
      <ul>
        <li><strong>Booking confirmations</strong> sent to customers when a cleaning is scheduled and confirmed.</li>
        <li><strong>Job offers</strong> sent to pros when a customer in their service area requests a cleaning.</li>
        <li><strong>Appointment reminders</strong> sent to both customers and pros before scheduled cleanings.</li>
        <li><strong>Job updates</strong> sent when a pro is en route, has arrived, or has completed a cleaning.</li>
        <li><strong>Payment receipts</strong> sent to customers after a job is paid.</li>
        <li><strong>Review requests</strong> sent to customers after a completed job.</li>
        <li><strong>Account and security messages</strong> such as login codes or password resets.</li>
      </ul>

      <h2>2. Consent &amp; Opt-In</h2>
      <p>You provide consent to receive SMS messages from BubbleBox by:</p>
      <ul>
        <li><strong>As a customer:</strong> entering your mobile phone number when booking a cleaning at homeproatl.xyz and submitting the booking form. The booking form discloses that SMS messages will be sent to the provided number for the purposes described in Section 1.</li>
        <li><strong>As a pro:</strong> completing the BubbleBox provider onboarding process, which includes explicit acknowledgment of these SMS Terms.</li>
      </ul>
      <p>
        Consent to receive SMS messages is not a condition of purchasing any
        goods or services beyond the SMS-enabled features of the BubbleBox
        marketplace.
      </p>

      <h2>3. Message Frequency</h2>
      <p>
        Message frequency varies based on your activity. A typical customer
        will receive between 3 and 8 SMS messages per booking. A typical pro
        will receive several job offer messages per day, depending on demand
        in their service area.
      </p>

      <h2>4. Opt-Out (STOP)</h2>
      <p>
        You can opt out of all BubbleBox SMS messages at any time by replying{" "}
        <strong>STOP</strong> to any message you receive from us. After
        replying STOP, you will receive a single confirmation message and will
        not receive further SMS messages from BubbleBox unless you re-enroll.
      </p>
      <p>
        To re-enroll after opting out, contact us at{" "}
        <a href="mailto:bubbleboxusa@gmail.com">bubbleboxusa@gmail.com</a> or
        text <strong>START</strong> to the BubbleBox number that previously
        messaged you.
      </p>
      <p>
        Note that opting out of SMS may affect your ability to use BubbleBox
        services. Pros who opt out will not receive job offers. Customers who
        opt out will not receive booking confirmations or appointment
        reminders, which may impact service quality.
      </p>

      <h2>5. Help (HELP)</h2>
      <p>
        For help, reply <strong>HELP</strong> to any BubbleBox SMS message, or
        contact our support team at{" "}
        <a href="mailto:bubbleboxusa@gmail.com">bubbleboxusa@gmail.com</a>.
      </p>

      <h2>6. Message and Data Rates</h2>
      <p>
        Message and data rates may apply to all SMS messages sent and received.
        Rates are determined by your wireless carrier. BubbleBox is not
        responsible for any charges incurred from your wireless carrier as a
        result of using our SMS program. Please consult your wireless carrier's
        plan for details.
      </p>

      <h2>7. Supported Carriers</h2>
      <p>
        BubbleBox SMS messages are supported on all major U.S. wireless
        carriers, including AT&amp;T, Verizon, T-Mobile, Sprint, U.S. Cellular,
        Boost Mobile, MetroPCS, Cricket Wireless, and most regional and MVNO
        carriers. T-Mobile is not liable for delayed or undelivered messages.
      </p>

      <h2>8. Privacy</h2>
      <p>
        Information you provide to BubbleBox in connection with this SMS
        program will be handled in accordance with our{" "}
        <a href="/privacy">Privacy Policy</a>. We do not sell your phone
        number or share it with third parties for marketing purposes. Phone
        numbers are shared only between matched customers and pros for the
        purpose of completing a scheduled cleaning, and with our SMS service
        provider (Twilio) solely for message delivery.
      </p>

      <h2>9. Changes to These Terms</h2>
      <p>
        BubbleBox may update these SMS Terms from time to time. Changes will be
        posted at this URL with an updated "Last updated" date. Material
        changes that affect your rights will be communicated via SMS or email
        when possible.
      </p>

      <h2>10. Contact</h2>
      <p>Questions about our SMS program?</p>
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
