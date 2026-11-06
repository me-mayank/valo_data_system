// FR-PUB-02 — Course Catalogue Page
// Server component fetching live published courses from backend API.
// Tag: 'courses', revalidate: 60.

import { apiGet } from '@/lib/api/server';
import CoursesCatalog from '@/components/site/CoursesCatalog';

export const revalidate = 60;

export const metadata = {
  title: 'Courses & Curriculum Catalogue | Data Valo System',
  description:
    'Structured, scenario-driven programs covering ServiceNow, Jira, and DevOps tooling. Built for engineering students.',
};

export default async function CoursesPage() {
  let courses = [];
  try {
    const data = await apiGet('/api/public/courses', {
      tags: ['courses'],
      revalidate: 60,
      forwardCookies: false,
    });
    courses = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch public courses:', err.message);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 w-full space-y-8">
      {/* Page Header */}
      <div>
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
          DATA VALO SYSTEM / COURSE CATALOGUE
        </p>
        <h1 className="font-mono font-semibold text-2xl md:text-4xl text-navy mt-1">
          Courses & training modules.
        </h1>
        <p className="font-sans text-base text-navy-soft max-w-2xl mt-2">
          Structured, scenario-driven programs covering ServiceNow, Jira, and DevOps tooling. Hands-on enterprise platform training.
        </p>
      </div>

      <CoursesCatalog initialCourses={courses} />
    </div>
  );
}
