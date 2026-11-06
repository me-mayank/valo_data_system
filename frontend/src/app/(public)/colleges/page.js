// FR-PUB-05 — For Colleges Page
// Workshop formats, student outcomes, how a campus visit works,
// and the Campus Request form UI (FR-FORM-02).

import SectionHeader from '@/components/site/SectionHeader';
import CampusRequestForm from '@/components/forms/CampusRequestForm';

export const metadata = {
  title: 'For Colleges & Institutional Workshops | Data Valo System',
  description:
    'Collaborate with Data Valo System for on-campus enterprise tool training in ServiceNow, Jira, and DevOps for engineering students.',
};

export default function CollegesPage() {
  const formats = [
    {
      code: 'F-01',
      title: '2-Day Intensive Hands-on Workshop',
      duration: '16 hours (2 consecutive days)',
      desc: 'Interactive lab sessions where students configure real workflows, navigate role architectures, and resolve live incident scenarios in enterprise platforms.',
    },
    {
      code: 'F-02',
      title: '4-Week Practical Industry Elective',
      duration: '32 hours (flexible hybrid schedule)',
      desc: 'In-depth cohort training designed to complement academic curricula with industry-standard workflow training and resume-ready scenario deliverables.',
    },
    {
      code: 'F-03',
      title: '1-Day Campus Seminar & Tech Talk',
      duration: '4 to 6 hours',
      desc: 'Overview of enterprise service architectures, what tech recruiters look for during hiring drives, and live tool demonstrations.',
    },
  ];

  const outcomes = [
    {
      num: '01',
      title: 'Day-One Deployment',
      desc: 'Graduates understand enterprise ticketing, sprint boards, and code review lifecycles without weeks of corporate onboarding.',
    },
    {
      num: '02',
      title: 'Campus Placement Edge',
      desc: 'Standing out during technical rounds by demonstrating familiarity with enterprise platforms (ServiceNow/Jira) rather than only textbook theory.',
    },
    {
      num: '03',
      title: 'Verified Proof of Work',
      desc: 'Every student completes real scenario deliverables that can be verified and referenced on CVs and professional profiles.',
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 w-full space-y-16">
      {/* Page Header */}
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
          DATA VALO SYSTEM / INSTITUTIONAL PARTNERSHIPS
        </p>
        <h1 className="font-mono font-semibold text-2xl md:text-4xl text-navy mt-1">
          Bridging academia and enterprise software tools.
        </h1>
        <p className="font-sans text-base text-navy-soft max-w-2xl mt-2">
          We collaborate with universities, engineering colleges, and Training & Placement Cells (TPOs) to deliver industry-grade tool training on campus.
        </p>
      </div>

      {/* Workshop Formats Section */}
      <section className="space-y-6">
        <SectionHeader index="01" label="Workshop & delivery formats" meta="ON-CAMPUS OR VIRTUAL" />
        <div className="grid grid-cols-1 md:grid-cols-3 border-[1px] border-navy">
          {formats.map(({ code, title, duration, desc }) => (
            <div
              key={code}
              className="p-6 border-[1px] border-navy -m-px bg-cream flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-coral block mb-2">
                  [{code}] {duration}
                </span>
                <h3 className="font-mono font-semibold text-base text-navy mb-2">
                  {title}
                </h3>
                <p className="font-sans text-sm text-navy-soft leading-relaxed">
                  {desc}
                </p>
              </div>
              <div className="border-t-[1px] border-rule-soft pt-2">
                <span className="font-mono text-[10px] uppercase text-navy-soft">
                  CUSTOMIZABLE FOR B.TECH / MCA / BCA
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Placement Outcomes Section */}
      <section className="space-y-6">
        <SectionHeader index="02" label="Student placement outcomes" meta="MEASURABLE IMPACT" />
        <div className="grid grid-cols-1 md:grid-cols-3 border-[1px] border-navy">
          {outcomes.map(({ num, title, desc }) => (
            <div
              key={num}
              className="p-6 border-[1px] border-navy -m-px bg-cream flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="font-mono text-3xl font-semibold text-navy-soft block mb-2">
                  {num}
                </span>
                <h3 className="font-mono font-semibold text-base text-navy mb-2">
                  {title}
                </h3>
                <p className="font-sans text-sm text-navy-soft leading-relaxed">
                  {desc}
                </p>
              </div>
              <div className="border-t-[1px] border-rule-soft pt-2">
                <span className="font-mono text-[10px] uppercase text-navy-soft">
                  DV-OUTCOME-{num}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Campus Request Form (FR-FORM-02) */}
      <section className="space-y-6">
        <SectionHeader index="03" label="Request a campus visit or workshop" meta="FORM DV-CAMPUS-01" />

        <div className="border-[2px] border-navy bg-cream p-6 md:p-8 max-w-2xl">
          <CampusRequestForm />
        </div>
      </section>
    </div>
  );
}
