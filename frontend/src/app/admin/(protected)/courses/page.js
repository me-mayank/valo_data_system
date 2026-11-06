import { apiGet } from '@/lib/api/server';
import { CoursesTable } from '@/components/admin/CoursesTable';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  let courses = [];
  try {
    const data = await apiGet('/api/admin/courses?limit=100', {
      forwardCookies: true,
      cache: 'no-store',
    });
    courses = Array.isArray(data) ? data : data?.courses || [];
  } catch (err) {
    console.error('Failed to load courses for admin:', err);
  }

  return (
    <div>
      {/* Page Header */}
      <div className="border-b border-navy pb-4 mb-6">
        <span className="font-mono text-xs text-navy-soft uppercase">[SECTION 02]</span>
        <h1 className="font-mono text-2xl font-bold uppercase text-navy">
          Course Curriculum Registry
        </h1>
        <p className="font-sans text-xs text-navy-soft mt-1">
          Manage course catalogue, syllabi, status visibility, and public catalog order.
        </p>
      </div>

      <CoursesTable initialCourses={courses} />
    </div>
  );
}
