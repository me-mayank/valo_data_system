// FR-PUB-01 — Home Page
// Sections in order:
// 1. Hero (navy block, 12-column grid): left 7 cols headline, sub, buttons; right 5 cols spec panel
// 2. Tools strip: plain text in row of bordered cells (no logos)
// 3. Featured courses: up to 3 published courses
// 4. How it works: 3 numbered steps
// 5. CTA band: cream background, 2px navy border, one sentence, one coral button

import Link from 'next/link';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/site/SectionHeader';
import SpecList from '@/components/site/SpecList';
import CourseCell from '@/components/site/CourseCell';
import { apiGet } from '@/lib/api/server';

export const revalidate = 60;

export const metadata = {
  title: 'Data Valo System — Hands-on Industry Tools Training',
  description:
    'Hands-on training in ServiceNow, Jira, and related enterprise tools. Built for college students.',
};

export default async function HomePage() {
  let courses = [];
  try {
    const data = await apiGet('/api/public/courses', {
      tags: ['courses'],
      revalidate: 60,
      forwardCookies: false,
    });
    courses = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to load featured courses for homepage:', err.message);
  }

  const featuredCourses = courses.filter((c) => c.featured).slice(0, 3);
  const displayCourses = featuredCourses.length > 0 ? featuredCourses : courses.slice(0, 3);

  const heroSpecItems = [
    { key: 'PROGRAM', value: 'Industry tools training' },
    { key: 'TOOLS', value: 'ServiceNow, Jira, Confluence, Git' },
    { key: 'FORMAT', value: 'Online / Offline / Hybrid' },
    { key: 'AUDIENCE', value: 'College students (2nd to 4th year)' },
    { key: 'STATUS', value: 'Registering interest for upcoming cohorts' },
  ];

  const tools = [
    'ServiceNow',
    'Jira Software',
    'Confluence',
    'Git & GitHub',
    'ITSM Frameworks',
    'Agile & Scrum',
  ];

  const steps = [
    {
      num: '01',
      title: 'Learn the tool',
      desc: 'Understand platform navigation, role architectures, and real configurations instead of abstract theory.',
    },
    {
      num: '02',
      title: 'Practise on real scenarios',
      desc: 'Solve actual enterprise incidents, build agile boards, and handle deployment pipelines in simulated environments.',
    },
    {
      num: '03',
      title: 'Get job-ready',
      desc: 'Speak the language engineering and IT teams speak from day one on campus recruitment drives.',
    },
  ];

  return (
    <div className="flex flex-col space-y-16 pb-16">
      {/* ── 1. HERO SECTION (Navy block, 12-column grid per PRD §10.5) ── */}
      <section className="bg-navy text-cream border-b-[2px] border-navy py-12 md:py-20 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 columns: Headline, sub, buttons */}
          <div className="lg:col-span-7 space-y-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-coral">
              DATA VALO SYSTEM / WORKSHOP & TRAINING INITIATIVE
            </p>
            <h1 className="font-mono font-semibold text-3xl sm:text-4xl md:text-5xl leading-[1.15] text-cream">
              Learn the tools real software teams use.
            </h1>
            <p className="font-sans text-base sm:text-lg text-sand max-w-xl leading-relaxed">
              Hands-on training in ServiceNow, Jira, and related enterprise tools. Built for college students.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button as={Link} href="/courses" variant="primary">
                Explore courses →
              </Button>
              <Button
                as={Link}
                href="/contact"
                variant="secondary"
                className="border-cream text-cream hover:bg-navy-soft"
              >
                Register interest
              </Button>
            </div>
          </div>

          {/* Right 5 columns: Spec panel (PRD §10.5) */}
          <div className="lg:col-span-5 bg-navy border-[2px] border-cream p-4 sm:p-6">
            <div className="border-b-[1px] border-rule-soft pb-2 mb-4">
              <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-rule-soft">
                SPEC-SHEET: DV-INIT-01
              </span>
            </div>
            <dl className="w-full space-y-3">
              {heroSpecItems.map(({ key, value }, i) => (
                <div
                  key={key}
                  className={[
                    'flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 pb-2',
                    i < heroSpecItems.length - 1 ? 'border-b-[1px] border-rule-soft' : '',
                  ].join(' ')}
                >
                  <dt className="font-mono text-[12px] uppercase tracking-[0.08em] text-coral w-28 shrink-0">
                    {key}:
                  </dt>
                  <dd className="font-sans text-sm text-cream m-0 leading-snug">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── 2. TOOLS STRIP (Plain text bordered cells, no logos per PRD §10.5 & §7.1) ── */}
      <section className="max-w-[1200px] mx-auto px-4 w-full">
        <div className="border-b-[1px] border-navy pb-2 mb-4 flex items-baseline justify-between">
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
            ENTERPRISE PLATFORMS COVERED (PLAIN TEXT NAMES ONLY — NO 3RD PARTY LOGOS)
          </span>
          <span className="font-mono text-[12px] text-navy-soft uppercase">
            [TOOLS INDEX]
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-[1px] border-navy">
          {tools.map((tool) => (
            <div
              key={tool}
              className="p-4 border-[1px] border-navy -m-px flex items-center justify-center text-center bg-cream hover:bg-sand transition-colors duration-[100ms]"
            >
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.04em] text-navy">
                {tool}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. FEATURED COURSES (PRD §7.1 FR-PUB-01) ── */}
      <section className="max-w-[1200px] mx-auto px-4 w-full space-y-6">
        <SectionHeader
          index="01"
          label="Featured courses"
          meta="MANAGED VIA ADMIN CATALOGUE"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 border-[1px] border-navy">
          {displayCourses.map((course) => (
            <div key={course._id || course.slug} className="border-[1px] border-navy -m-px">
              <CourseCell
                code={course.code}
                title={course.title}
                shortDescription={course.shortDescription}
                duration={course.duration}
                mode={course.mode}
                level={course.level}
                tools={course.tools}
                slug={course.slug}
                thumbnail={course.thumbnail}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Link
            href="/courses"
            className="font-mono text-sm uppercase tracking-[0.04em] text-navy hover:text-coral transition-colors duration-[100ms] flex items-center gap-2"
          >
            <span>View complete catalogue {courses.length > 0 ? `(${courses.length} courses)` : ''}</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS (3 numbered cells per PRD §10.5 & §10.6) ── */}
      <section className="max-w-[1200px] mx-auto px-4 w-full space-y-6">
        <SectionHeader index="02" label="How it works" meta="TRAINING METHODOLOGY" />
        <div className="grid grid-cols-1 md:grid-cols-3 border-[1px] border-navy">
          {steps.map(({ num, title, desc }) => (
            <div
              key={num}
              className="p-6 border-[1px] border-navy -m-px bg-cream flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="font-mono text-3xl font-semibold text-navy-soft block mb-2">
                  {num}
                </span>
                <h3 className="font-mono font-semibold text-lg text-navy mb-2">
                  {title}
                </h3>
                <p className="font-sans text-sm text-navy-soft leading-relaxed">
                  {desc}
                </p>
              </div>
              <div className="border-t-[1px] border-rule-soft pt-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-navy-soft">
                  DV-STEP-{num}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. CTA BAND (Cream background, 2px navy border per PRD §10.5) ── */}
      <section className="max-w-[1200px] mx-auto px-4 w-full">
        <div className="border-[2px] border-navy p-6 md:p-8 bg-cream flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
              ADMISSIONS & ENQUIRIES OPEN
            </p>
            <h2 className="font-mono font-semibold text-xl md:text-2xl text-navy">
              Register interest for upcoming campus batches.
            </h2>
          </div>
          <Button as={Link} href="/contact" variant="primary" className="shrink-0">
            Register interest →
          </Button>
        </div>
      </section>
    </div>
  );
}
