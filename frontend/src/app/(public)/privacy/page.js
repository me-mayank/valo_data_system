// FR-PUB-07 & NFR-06 — Privacy Policy Page
// India Digital Personal Data Protection Act (DPDP Act, 2023) compliance text.

import SectionHeader from '@/components/site/SectionHeader';

export const metadata = {
  title: 'Privacy Policy | Data Valo System',
  description:
    'Information on how Data Valo System collects, uses, and protects student and college partner data.',
};

export default function PrivacyPage() {
  return (
    <article className="max-w-[840px] mx-auto px-4 py-8 md:py-12 w-full space-y-10">
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
          LEGAL & COMPLIANCE / DOC DV-PRIVACY-01
        </p>
        <h1 className="font-mono font-semibold text-2xl md:text-4xl text-navy mt-1">
          Privacy Policy
        </h1>
        <p className="font-mono text-xs text-navy-soft mt-2 uppercase tracking-[0.04em]">
          LAST UPDATED: NOVEMBER 2026 / COMPLIANT WITH DIGITAL PERSONAL DATA PROTECTION ACT (INDIA, 2023)
        </p>
      </div>

      <div className="border-[1px] border-navy p-6 bg-cream space-y-8 font-sans text-sm text-navy leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <SectionHeader index="01" label="Overview & scope" />
          <p>
            Data Valo System (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates this marketing and course enquiry platform. We are committed to safeguarding personal data collected from students, faculty members, and institutional placement coordinators in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <SectionHeader index="02" label="Data we collect" />
          <p>
            We collect personal data strictly when you provide it via our student lead forms or campus workshop enquiry forms:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-navy-soft">
            <li>Full Name</li>
            <li>Phone Number / WhatsApp Contact</li>
            <li>Email Address</li>
            <li>College / University Name and Year of Study</li>
            <li>Courses and Topics of Interest</li>
            <li>Optional demographic details (City, Mode Preference, Skill Level)</li>
            <li>Campaign attribution source tag (?src= parameter on QR scans)</li>
            <li>Device type (mobile, tablet, desktop) and consent timestamp</li>
          </ul>
          <p className="font-mono text-xs text-coral font-medium">
            NOTICE: Raw IP addresses are NEVER stored in our database. IP addresses are hashed using a secure server-side salt solely for short-term rate-limiting and abuse prevention, after which rate-limit logs are automatically purged within 24 hours.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <SectionHeader index="03" label="Purpose of data collection" />
          <p>
            We collect and process personal data solely for the following specified purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contacting registered students regarding upcoming training cohorts, orientation sessions, and workshop schedules.</li>
            <li>Coordinating institutional campus visits and tailored faculty workshops with college placement cells.</li>
            <li>Attribution analysis to determine which campus drives or college talks generate interest.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <SectionHeader index="04" label="Data retention & security" />
          <p>
            Lead data is stored in secured, access-restricted databases with encrypted connections. We do not sell, rent, or lease student contact details to third-party marketing brokers or ad networks. Data is retained only for as long as necessary to conduct training operations or until you exercise your right to erasure.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <SectionHeader index="05" label="Your rights & data erasure" />
          <p>
            Under the DPDP Act, 2023, data principals have the right to review their stored personal data, request corrections, and demand permanent erasure of their records.
          </p>
          <p>
            To request deletion of your contact records from our systems, email us at{' '}
            <a
              href="mailto:info@datavalosystem.com?subject=Data%20Erasure%20Request"
              className="font-mono underline text-coral hover:text-navy"
            >
              [PLACEHOLDER: info@datavalosystem.com]
            </a>{' '}
            with your registered email or phone number. Requests are processed within 7 business days.
          </p>
        </section>
      </div>
    </article>
  );
}
