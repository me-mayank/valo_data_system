// FR-PUB-03 — Course Detail Page
// Two columns (PRD §10.5):
// Left: Overview, syllabus accordion, "Who it's for"
// Right: Sticky spec panel (CODE, DURATION, MODE, LEVEL, TOOLS, AUDIENCE) + Enquire button
// 404 for missing or unpublished slugs
// SEO: JSON-LD Course schema + dynamic metadata

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Accordion from '@/components/ui/Accordion';
import SectionHeader from '@/components/site/SectionHeader';
import SpecList from '@/components/site/SpecList';
import EnquireButton from '@/components/site/EnquireButton';
import { apiGet } from '@/lib/api/server';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const course = await apiGet(`/api/public/courses/${slug}`, {
      tags: ['courses', `course-${slug}`],
      revalidate: 60,
      forwardCookies: false,
    });
    if (!course) return { title: 'Course Not Found | Data Valo System' };

    return {
      title: `${course.title} ${course.code ? `(${course.code})` : ''} | Data Valo System`,
      description: course.shortDescription,
      openGraph: {
        title: `${course.title} | Data Valo System`,
        description: course.shortDescription,
        images: course.thumbnail?.url ? [course.thumbnail.url] : [],
      },
    };
  } catch {
    return { title: 'Course Not Found | Data Valo System' };
  }
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  let course;

  try {
    course = await apiGet(`/api/public/courses/${slug}`, {
      tags: ['courses', `course-${slug}`],
      revalidate: 60,
      forwardCookies: false,
    });
  } catch (err) {
    if (err.statusCode === 404) {
      notFound();
    }
    throw err;
  }

  if (!course) {
    notFound();
  }

  const specItems = [
    ...(course.code ? [{ key: 'CODE', value: course.code }] : []),
    ...(course.category ? [{ key: 'CATEGORY', value: course.category }] : []),
    ...(course.duration ? [{ key: 'DURATION', value: course.duration }] : []),
    { key: 'MODE', value: (course.mode || 'online').toUpperCase() },
    { key: 'LEVEL', value: (course.level || 'beginner').toUpperCase() },
    { key: 'TOOLS', value: (course.tools || []).join(', ') || '—' },
    ...(course.fee ? [{ key: 'FEE', value: `₹${course.fee}` }] : []),
  ];

  const accordionItems = (course.syllabus || []).map((mod, idx) => ({
    id: `mod-${idx}`,
    title: mod.title,
    content: (
      <ul className="list-disc pl-5 space-y-1 font-sans text-sm text-navy leading-relaxed">
        {(mod.topics || []).map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
    ),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription,
    courseCode: course.code,
    provider: {
      '@type': 'Organization',
      name: 'Data Valo System',
      sameAs: process.env.NEXT_PUBLIC_SITE_URL || 'https://datavalosystem.com',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.mode,
      courseWorkload: course.duration,
    },
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 w-full space-y-8">
      {/* Inject JSON-LD Course structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb / Top Index */}
      <nav aria-label="Breadcrumb" className="border-b-[1px] border-navy pb-3 flex items-center justify-between">
        <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft flex items-center gap-2">
          <Link href="/courses" className="hover:text-navy transition-colors duration-[100ms]">
            COURSES
          </Link>
          <span>/</span>
          <span className="text-navy font-bold truncate max-w-[200px] sm:max-w-none">
            {course.title.toUpperCase()}
          </span>
        </div>
        {course.code && (
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-coral font-bold">
            [{course.code}]
          </span>
        )}
      </nav>

      {/* Main Two-Column Layout (PRD §10.5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Content, Syllabus, Who it's for */}
        <div className="lg:col-span-7 space-y-10">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2 font-mono text-[12px] text-navy-soft uppercase">
              {course.category && <span>{course.category}</span>}
              {course.category && <span>·</span>}
              <span className="capitalize">{course.level} Level</span>
            </div>
            <h1 className="font-mono font-semibold text-3xl md:text-4xl text-navy leading-tight">
              {course.title}
            </h1>
            <p className="font-sans text-base text-navy-soft mt-3 leading-relaxed">
              {course.shortDescription}
            </p>
          </div>

          {/* Overview */}
          {course.overview && (
            <section className="space-y-3">
              <SectionHeader index="01" label="Program overview" />
              <div className="border-[1px] border-navy p-6 bg-cream">
                <p className="font-sans text-base text-navy leading-relaxed whitespace-pre-line">
                  {course.overview}
                </p>
              </div>
            </section>
          )}

          {/* Syllabus Accordion */}
          {accordionItems.length > 0 && (
            <section className="space-y-3">
              <SectionHeader
                index="02"
                label="Curriculum syllabus"
                meta={`${accordionItems.length} MODULE${accordionItems.length === 1 ? '' : 'S'}`}
              />
              <div className="border-[1px] border-navy bg-cream">
                <Accordion items={accordionItems} />
              </div>
            </section>
          )}

          {/* Who it's for */}
          {course.audience && (
            <section className="space-y-3">
              <SectionHeader index="03" label="Target audience" />
              <div className="border-[1px] border-navy p-6 bg-cream">
                <p className="font-sans text-base text-navy leading-relaxed">
                  {course.audience}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column (5 cols): Sticky Spec Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
          <aside aria-label="Course Specifications" className="border-[2px] border-navy bg-sand/30 p-6 space-y-6">
            <div>
              <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
                SPECIFICATION SHEET
              </p>
              <h2 className="font-mono font-bold text-lg text-navy mt-1">
                {course.title}
              </h2>
            </div>

            <SpecList items={specItems} />

            <div className="space-y-2 pt-2">
              <EnquireButton courseId={course._id} />
              <p className="font-mono text-[11px] text-navy-soft text-center leading-snug">
                Opens registration enquiry with this program preselected.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
