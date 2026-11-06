// FR-PUB-04 — About Page
// Mission, industry-gap story, and placeholder block for team/trainer profiles.

import SectionHeader from '@/components/site/SectionHeader';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export const metadata = {
  title: 'About | Data Valo System',
  description:
    'Our mission is to train college students on the actual internal tools used in enterprise software teams.',
};

export default function AboutPage() {
  const values = [
    {
      code: 'V-01',
      title: 'Tools Over Pure Theory',
      desc: 'Coding alone is not enough. Enterprise engineering teams live in ServiceNow, Jira, and collaborative Git repos. We prioritize operational literacy.',
    },
    {
      code: 'V-02',
      title: 'Real Scenarios, Not Demos',
      desc: 'Students practice by handling simulated incidents, configuring real sprint workflows, and resolving deployment blockers.',
    },
    {
      code: 'V-03',
      title: 'College-Focused Accessibility',
      desc: 'Direct campus delivery, affordable cohort structures, and tailored pacing for 2nd, 3rd, and 4th-year engineering students.',
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 w-full space-y-16">
      {/* Header */}
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
          DATA VALO SYSTEM / COMPANY PROFILE
        </p>
        <h1 className="font-mono font-semibold text-2xl md:text-4xl text-navy mt-1">
          Solving the enterprise tool gap in tech education.
        </h1>
        <p className="font-sans text-base sm:text-lg text-navy-soft max-w-2xl mt-3 leading-relaxed">
          Data Valo System is a specialized training organization dedicated to preparing college students for modern software engineering and IT operations environments.
        </p>
      </div>

      {/* The Industry-Gap Story */}
      <section className="space-y-4">
        <SectionHeader index="01" label="The industry-gap problem" meta="BACKGROUND" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-[1px] border-navy p-6 md:p-8 bg-cream">
          <div className="space-y-3">
            <h3 className="font-mono font-semibold text-base text-navy">
              What engineering colleges teach:
            </h3>
            <p className="font-sans text-sm text-navy-soft leading-relaxed">
              Academic institutions excel at theoretical fundamentals: algorithm analysis, database normalization, operating system internals, and discrete mathematics. Students write standalone scripts in sandbox environments.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-mono font-semibold text-base text-coral">
              What enterprise software teams require:
            </h3>
            <p className="font-sans text-sm text-navy leading-relaxed">
              From day one, junior engineers are thrust into ticketing systems (ServiceNow), agile backlog boards (Jira), branch-policy pull requests (Git), and multi-tier IT service frameworks. Without hands-on exposure, graduates spend their first six months playing catch-up.
            </p>
          </div>
        </div>
      </section>

      {/* Guiding Principles */}
      <section className="space-y-6">
        <SectionHeader index="02" label="Guiding principles" meta="CORE VALUES" />
        <div className="grid grid-cols-1 md:grid-cols-3 border-[1px] border-navy">
          {values.map(({ code, title, desc }) => (
            <div
              key={code}
              className="p-6 border-[1px] border-navy -m-px bg-cream space-y-2"
            >
              <span className="font-mono text-[12px] uppercase text-navy-soft block">
                [{code}]
              </span>
              <h3 className="font-mono font-semibold text-base text-navy">
                {title}
              </h3>
              <p className="font-sans text-sm text-navy-soft leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team / Trainer Profiles (Placeholder per PRD §7.1 FR-PUB-04 & §10.6) */}
      <section className="space-y-6">
        <SectionHeader index="03" label="Instructors & leadership" meta="PROFILES" />
        <div className="border-[1px] border-navy p-6 md:p-8 bg-cream space-y-4">
          <div className="border-b-[1px] border-rule-soft pb-2 flex items-baseline justify-between">
            <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
              FACULTY & INDUSTRY PRACTITIONERS
            </span>
            <span className="font-mono text-[10px] text-navy-soft uppercase">
              STATUS: [PROVISIONAL COPY]
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="font-mono font-semibold text-base text-navy">
              Industry Trainers & Program Mentors
            </h4>
            <p className="font-sans text-sm text-navy-soft leading-relaxed">
              [PLACEHOLDER: Data Valo System courses are led by practitioners with active background in enterprise software delivery, IT service management (ITSM), and agile project execution. Detailed trainer biographies, certifications, and LinkedIn credentials will be published prior to public batch launches.]
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-[2px] border-navy p-6 bg-cream flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-mono font-semibold text-base text-navy">
            Interested in bringing Data Valo System to your campus?
          </h3>
          <p className="font-sans text-sm text-navy-soft">
            Explore our college workshops or request a preliminary discussion with our training coordinator.
          </p>
        </div>
        <Button as={Link} href="/colleges" variant="primary">
          For Colleges →
        </Button>
      </section>
    </div>
  );
}
