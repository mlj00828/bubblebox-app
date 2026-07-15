import { LegalPage } from "@/components/LegalPage";

export const metadata = {
  title: "Pro Agreements",
  description:
    "BubbleBox Independent Contractor Agreement, Anti-Circumvention Agreement, Platform Terms, and Background Check Consent.",
};

export default function AgreementPage() {
  return (
    <LegalPage title="Pro Agreements" updated="April 30, 2026">
      <div className="callout">
        <p>
          <strong>Important notice:</strong> These documents form a legally
          binding agreement between you and BubbleBox once you check the boxes
          and submit your application. We strongly recommend you read each
          section. Have questions? Email{" "}
          <a href="mailto:hello@bubbleboxatl.com">hello@bubbleboxatl.com</a>{" "}
          before agreeing.
        </p>
        <p style={{ marginTop: "0.75rem", marginBottom: 0 }}>
          <strong>Placeholder notice:</strong> These agreements are draft
          versions and will be replaced with attorney-reviewed final versions
          before any pro is approved to perform paid work through the platform.
        </p>
      </div>

      {/* ===== INDEPENDENT CONTRACTOR ===== */}
      <h2 id="contractor">1. Independent Contractor Agreement</h2>

      <p>
        By accepting this agreement, you (&ldquo;Pro&rdquo;) and BubbleBox
        (&ldquo;Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) acknowledge
        and agree to the following independent contractor relationship.
      </p>

      <p>
        <strong>1.1 Independent Contractor Status.</strong> You are an
        independent contractor and not an employee, agent, joint venturer, or
        partner of BubbleBox. Nothing in this agreement creates an
        employer-employee relationship. You will not be eligible for any
        employee benefits, including but not limited to: health insurance,
        unemployment insurance, workers&apos; compensation, paid time off, or
        retirement benefits.
      </p>

      <p>
        <strong>1.2 Tax Responsibility.</strong> You are solely responsible for
        all federal, state, and local taxes on income earned through the
        Platform, including self-employment tax. BubbleBox will issue a Form
        1099-NEC at year-end for total payments of $600 or more. You are
        required to provide a completed Form W-9 before receiving payments.
      </p>

      <p>
        <strong>1.3 Control and Independence.</strong> You retain the right to:
      </p>
      <ul>
        <li>Accept or decline any job offer at your discretion</li>
        <li>Set your own work schedule</li>
        <li>Determine the methods and equipment used to perform cleaning work</li>
        <li>Provide services to other clients or platforms (subject to Section 2)</li>
        <li>Hire your own assistants (subject to BubbleBox vetting if they will work on Platform jobs)</li>
      </ul>

      <p>
        <strong>1.4 Equipment and Supplies.</strong> Unless otherwise agreed in
        writing, you are responsible for providing your own cleaning supplies,
        equipment, and transportation.
      </p>

      <p>
        <strong>1.5 Insurance and Liability.</strong> BubbleBox does not provide
        you with general liability or workers&apos; compensation insurance. You
        are encouraged to maintain your own general liability insurance and are
        responsible for any property damage, injury, or claims arising from
        your work.
      </p>

      <p>
        <strong>1.6 Payment Terms.</strong> BubbleBox pays Pros via Stripe on a
        daily basis after job completion and customer confirmation.
        BubbleBox&apos;s service fee is deducted before payout. You must
        complete Stripe Connect onboarding within 7 days of approval to receive
        payments.
      </p>

      <p>
        <strong>1.7 Termination.</strong> Either party may terminate this
        relationship at any time, with or without cause, by written notice
        (including email or in-app notice). Termination does not release you
        from obligations under Section 2 (Anti-Circumvention) which survive
        termination.
      </p>

      {/* ===== ANTI-CIRCUMVENTION ===== */}
      <h2 id="anti-circumvent">2. Anti-Circumvention Agreement</h2>

      <p>
        BubbleBox invests significant resources in customer acquisition,
        marketing, vetting, and platform technology. To protect this
        investment, you agree to the following terms.
      </p>

      <p>
        <strong>2.1 No Direct Solicitation.</strong> For the duration of your
        time on the Platform and for <strong>twelve (12) months</strong> after
        your last Platform job, you will not directly or indirectly:
      </p>
      <ul>
        <li>
          Contact, solicit, accept work from, or offer services to any
          BubbleBox customer outside of the Platform
        </li>
        <li>
          Encourage any BubbleBox customer to leave the Platform or use a
          competing service
        </li>
        <li>
          Provide your personal contact information, social media, business
          card, or website to BubbleBox customers, except as required to
          complete a Platform job
        </li>
        <li>
          Accept payment for cleaning services from a BubbleBox customer
          outside of the Platform&apos;s payment system
        </li>
      </ul>

      <p>
        <strong>2.2 Definition of &ldquo;BubbleBox Customer.&rdquo;</strong>{" "}
        Any individual, household, or business who has booked a service through
        BubbleBox at any point, regardless of whether you personally worked
        their job.
      </p>

      <p>
        <strong>2.3 Penalties for Violation.</strong> Violation of this section
        results in:
      </p>
      <ul>
        <li>Immediate removal from the Platform</li>
        <li>
          Forfeiture of any pending payouts or unpaid invoices held by the
          Platform
        </li>
        <li>
          A liquidated damages payment of <strong>$2,500 per occurrence</strong>{" "}
          payable to BubbleBox, which the parties agree is a reasonable
          estimate of damages and not a penalty
        </li>
        <li>
          BubbleBox may pursue additional legal action, including injunctive
          relief and recovery of attorneys&apos; fees
        </li>
      </ul>

      <p>
        <strong>2.4 Reasonableness.</strong> You acknowledge that the
        12-month restriction is reasonable in scope, duration, and geographic
        application (limited to the Atlanta metropolitan service area in which
        BubbleBox operates). If any provision is found unenforceable, the
        remainder remains in effect, and the unenforceable provision will be
        modified to the minimum extent necessary to be enforceable.
      </p>

      <p>
        <strong>2.5 Customers Approaching You Directly.</strong> If a BubbleBox
        customer attempts to book you directly outside the Platform, you must
        decline and direct them to book through BubbleBox. Failure to do so
        constitutes a violation of this section.
      </p>

      {/* ===== PLATFORM TERMS ===== */}
      <h2 id="platform">3. Platform Terms &amp; Pro Code of Conduct</h2>

      <p>
        <strong>3.1 Professional Standards.</strong> You agree to:
      </p>
      <ul>
        <li>Arrive within 15 minutes of the scheduled start time</li>
        <li>Complete jobs to the standards described in the booking</li>
        <li>Treat customers, their families, their pets, and their property with respect</li>
        <li>Wear clean, presentable attire</li>
        <li>Refrain from using customer property (food, beverages, electronics, etc.) without explicit permission</li>
        <li>Maintain customer privacy: do not photograph or share details of customer homes on social media or with third parties</li>
        <li>Communicate promptly with customers and BubbleBox via SMS or in-app messaging</li>
      </ul>

      <p>
        <strong>3.2 Prohibited Conduct.</strong> The following result in
        immediate removal from the Platform:
      </p>
      <ul>
        <li>Theft of customer property</li>
        <li>Damage to customer property without timely report</li>
        <li>Use of illegal substances on the job or arriving impaired</li>
        <li>Harassment, discrimination, or unprofessional behavior toward customers or other pros</li>
        <li>Bringing unauthorized persons (children, friends, etc.) to a job</li>
        <li>Sharing customer addresses or contact information with third parties</li>
        <li>Misrepresenting the work performed or the time spent</li>
      </ul>

      <p>
        <strong>3.3 Cancellations and No-Shows.</strong> Repeated cancellations
        of accepted jobs or no-shows result in account suspension. Three or
        more no-shows in a 90-day period result in permanent removal.
      </p>

      <p>
        <strong>3.4 Customer Reviews.</strong> Customers may leave reviews after
        each job. Pros with sustained ratings below 4.0 stars over 10+ jobs may
        be removed from the Platform.
      </p>

      <p>
        <strong>3.5 Account Sharing Prohibited.</strong> Your BubbleBox Pro
        account is for your individual use only. Sharing login credentials or
        sending another person to a job in your place is prohibited.
      </p>

      <p>
        <strong>3.6 Reporting Issues.</strong> If a customer&apos;s home is
        unsafe, the scope of work materially differs from the booking, or any
        other issue arises, contact BubbleBox immediately at{" "}
        <a href="mailto:hello@bubbleboxatl.com">hello@bubbleboxatl.com</a> or
        +1 (678) 820-4881.
      </p>

      {/* ===== BACKGROUND CHECK CONSENT ===== */}
      <h2 id="background">4. Background Check Consent</h2>

      <p>
        You authorize BubbleBox and its designated background check provider
        to conduct a background check, which may include:
      </p>
      <ul>
        <li>Criminal history (federal, state, and county records)</li>
        <li>Identity verification</li>
        <li>Sex offender registry check</li>
        <li>Driving record (if applicable to your role)</li>
        <li>Address history and right-to-work verification</li>
      </ul>

      <p>
        <strong>4.1 Disqualifying Offenses.</strong> Your application may be
        denied if your background check reveals any of the following:
      </p>
      <ul>
        <li>Felony convictions involving violence, theft, sex offenses, fraud, or property crimes within the past 7 years</li>
        <li>Active warrants or pending charges for any of the above</li>
        <li>Registration as a sex offender (regardless of timing)</li>
        <li>Identity verification failure</li>
      </ul>

      <p>
        <strong>4.2 Fair Chance Considerations.</strong> BubbleBox complies with
        the federal Fair Credit Reporting Act (FCRA) and applicable state
        Fair Chance laws. If we deny your application based on background
        check results, you will receive a copy of the report and an
        opportunity to dispute or explain.
      </p>

      <p>
        <strong>4.3 Ongoing Checks.</strong> BubbleBox may run periodic
        re-checks (typically annually) to maintain platform safety. You consent
        to these ongoing checks for as long as you remain an active Pro.
      </p>

      <p>
        <strong>4.4 Document Submission.</strong> Within 7 days of conditional
        approval, you must submit:
      </p>
      <ul>
        <li>A clear photo of your government-issued driver&apos;s license or state ID</li>
        <li>A completed and signed IRS Form W-9</li>
        <li>Proof of general liability insurance, if applicable</li>
      </ul>
      <p>
        These documents are stored securely. BubbleBox does not share your
        identity documents with customers or other pros.
      </p>

      {/* ===== GENERAL ===== */}
      <h2>5. General Provisions</h2>

      <p>
        <strong>5.1 Governing Law.</strong> This agreement is governed by the
        laws of the State of Georgia, without regard to its conflict of laws
        provisions. Any disputes must be brought in the state or federal courts
        located in Fulton County, Georgia.
      </p>

      <p>
        <strong>5.2 Modifications.</strong> BubbleBox may update these
        agreements from time to time. Material changes will be communicated
        via email or SMS, and continued use of the Platform after such
        notice constitutes acceptance.
      </p>

      <p>
        <strong>5.3 Entire Agreement.</strong> This document, along with the
        Platform Terms of Service and Privacy Policy, constitutes the entire
        agreement between you and BubbleBox regarding your status as a Pro.
      </p>

      <p>
        <strong>5.4 Severability.</strong> If any provision is found
        unenforceable, the remainder of the agreement remains in full force
        and effect.
      </p>

      <p>
        <strong>5.5 Contact.</strong> Questions about these agreements:
      </p>
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
