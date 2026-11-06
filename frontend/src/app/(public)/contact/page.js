// FR-PUB-06 — Contact / Register Page
// Full student lead form (FR-FORM-01 full variant)
// Contact information and institutional enquiry links.

import Link from 'next/link';
import Button from '@/components/ui/Button';
import StudentLeadForm from '@/components/forms/StudentLeadForm';
import { apiGet } from '@/lib/api/server';

export const revalidate = 60;

export const metadata = {
  title: 'Register Interest & Contact | Data Valo System',
  description:
    'Express interest in upcoming ServiceNow, Jira, and DevOps tool training cohorts or request curriculum information.',
};

export default async function ContactPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const requestedSlug = resolvedParams.course;

  let courses = [];
  let settings = null;

  try {
    const coursesData = await apiGet('/api/public/courses', {
      tags: ['courses'],
      revalidate: 60,
      forwardCookies: false,
    });
    courses = Array.isArray(coursesData) ? coursesData : [];
  } catch (err) {
    console.error('Failed to load courses for contact page:', err.message);
  }

  try {
    settings = await apiGet('/api/public/settings', {
      tags: ['settings'],
      revalidate: 60,
      forwardCookies: false,
    });
  } catch (err) {
    console.error('Failed to load settings for contact page:', err.message);
  }

  const email = settings?.contactEmail || 'info@datavalosystem.com';
  const phone = settings?.contactPhone || '+91 98765 43210';

  const preselectedCourse = requestedSlug
    ? courses.find((c) => c.slug === requestedSlug)
    : null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 w-full space-y-12">
      {/* Page Header */}
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
          DATA VALO SYSTEM / STUDENT REGISTRATION & ENQUIRIES
        </p>
        <h1 className="font-mono font-semibold text-2xl md:text-4xl text-navy mt-1">
          Register interest & contact.
        </h1>
        <p className="font-sans text-base text-navy-soft max-w-2xl mt-2">
          Fill out the student registration form below to express interest in upcoming tool training cohorts or request information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (8 cols): Full Student Lead Form (FR-FORM-01) */}
        <div className="lg:col-span-8 border-[2px] border-navy bg-cream p-6 md:p-8">
          <div className="border-b-[1px] border-navy pb-3 mb-6 flex items-baseline justify-between">
            <h2 className="font-mono font-semibold text-base uppercase text-navy">
              STUDENT REGISTRATION FORM
            </h2>
            <span className="font-mono text-[10px] text-navy-soft uppercase">
              FORM DV-LEAD-FULL
            </span>
          </div>

          <StudentLeadForm
            variant="contact"
            initialCourseId={preselectedCourse?._id}
            availableCourses={courses}
          />
        </div>

        {/* Right Info Column (4 cols): Direct Contact Details */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border-[2px] border-navy bg-cream p-5 sm:p-6 space-y-4">
            <h3 className="font-mono font-semibold text-sm uppercase tracking-[0.08em] text-navy border-b-[1px] border-navy pb-2">
              DIRECT CONTACT
            </h3>

            <div className="space-y-4 font-mono text-sm text-navy">
              <div>
                <span className="text-[12px] text-navy-soft uppercase tracking-[0.08em] block">
                  ADMISSIONS EMAIL
                </span>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-coral transition-colors duration-[100ms] block"
                >
                  {email}
                </a>
              </div>

              <div>
                <span className="text-[12px] text-navy-soft uppercase tracking-[0.08em] block">
                  PHONE / WHATSAPP HELPLINE
                </span>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="hover:text-coral transition-colors duration-[100ms] block"
                >
                  {phone}
                </a>
              </div>

              <div>
                <span className="text-[12px] text-navy-soft uppercase tracking-[0.08em] block">
                  OPERATING HOURS
                </span>
                <span className="font-sans text-sm text-navy-soft block">
                  Monday – Saturday: 10:00 AM – 6:00 PM IST
                </span>
              </div>
            </div>
          </div>

          <div className="border-[1px] border-navy bg-sand p-5 space-y-3">
            <h4 className="font-mono font-semibold text-xs uppercase tracking-[0.08em] text-navy">
              REPRESENTING A COLLEGE OR TPO?
            </h4>
            <p className="font-sans text-xs text-navy leading-relaxed">
              For campus-wide seminars, department electives, or recruitment partnerships, please use our dedicated institutional channel.
            </p>
            <Link href="/colleges" className="block w-full">
              <Button variant="secondary" className="w-full justify-center text-xs">
                Go to For Colleges →
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
