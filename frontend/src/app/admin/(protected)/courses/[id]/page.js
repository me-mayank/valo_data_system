import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api/server';
import { CourseForm } from '@/components/admin/CourseForm';

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({ params }) {
  const { id } = await params;

  let course;
  try {
    course = await apiGet(`/api/admin/courses/${id}`, {
      forwardCookies: true,
      cache: 'no-store',
    });
  } catch (err) {
    if (err.statusCode === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div>
      <CourseForm course={course} />
    </div>
  );
}
