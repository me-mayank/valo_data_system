// FR-PUB-07 — Terms of Service Page

import SectionHeader from '@/components/site/SectionHeader';

export const metadata = {
  title: 'Terms of Service | Data Valo System',
  description: 'Terms and conditions governing the use of the Data Valo System website and training registrations.',
};

export default function TermsPage() {
  return (
    <article className="max-w-[840px] mx-auto px-4 py-8 md:py-12 w-full space-y-10">
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
          LEGAL & COMPLIANCE / DOC DV-TERMS-01
        </p>
        <h1 className="font-mono font-semibold text-2xl md:text-4xl text-navy mt-1">
          Terms & Conditions
        </h1>
        <p className="font-mono text-xs text-navy-soft mt-2 uppercase tracking-[0.04em]">
          LAST UPDATED: NOVEMBER 2026 / JURISDICTION: INDIA
        </p>
      </div>

      <div className="border-[1px] border-navy p-6 bg-cream space-y-8 font-sans text-sm text-navy leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <SectionHeader index="01" label="Nature of service" />
          <p>
            Data Valo System provides vocational, practical training on enterprise software tools. Submission of a registration or enquiry form indicates an expression of interest and does not constitute a guaranteed enrollment or financial transaction.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <SectionHeader index="02" label="Intellectual property & trademarks" />
          <p>
            All course curricula, training materials, and website content created by Data Valo System remain the intellectual property of Data Valo System.
          </p>
          <div className="p-4 border-[1px] border-navy bg-sand space-y-2 font-mono text-xs text-navy">
            <span className="font-semibold block uppercase">TRADEMARK DISCLAIMER:</span>
            <p className="font-sans">
              ServiceNow is a registered trademark of ServiceNow, Inc. Jira and Confluence are registered trademarks of Atlassian Pty Ltd. Git is a registered trademark of Software Freedom Conservancy. Data Valo System is an independent training provider and is not affiliated with, endorsed by, or sponsored by ServiceNow, Inc., Atlassian Pty Ltd, or any other trademark holder mentioned.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <SectionHeader index="03" label="User conduct & accuracy" />
          <p>
            When submitting enquiry forms, users agree to provide truthful, accurate, and current contact details. Automated bot submissions, spam, and intentional form tampering are strictly prohibited.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <SectionHeader index="04" label="Limitation of liability" />
          <p>
            While Data Valo System strives to provide the highest standard of practical technical instruction, completion of any workshop or course does not guarantee employment or campus placement, which remain subject to individual hiring company criteria.
          </p>
        </section>
      </div>
    </article>
  );
}
