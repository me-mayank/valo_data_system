'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clientApi } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

export function CoursesTable({ initialCourses = [] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'ok') => {
    setToast({ message, type });
  };

  const filteredCourses = courses.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  });

  const handleToggleStatus = async (course) => {
    const nextStatus = course.status === 'published' ? 'draft' : 'published';
    setActionLoading(true);

    try {
      await clientApi.patch(`/api/admin/courses/${course._id}/status`, { status: nextStatus });
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, status: nextStatus } : c))
      );
      showToast(`Course "${course.title}" status changed to ${nextStatus.toUpperCase()}`);
    } catch (err) {
      showToast(err.message || 'Failed to update course status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (course) => {
    const nextFeatured = !course.featured;
    try {
      await clientApi.put(`/api/admin/courses/${course._id}`, { featured: nextFeatured });
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? { ...c, featured: nextFeatured } : c))
      );
      showToast(`Featured flag updated for "${course.title}"`);
    } catch (err) {
      showToast(err.message || 'Failed to update featured flag', 'error');
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filteredCourses.length) return;

    const list = [...filteredCourses];
    const current = list[index];
    const target = list[targetIndex];

    // Swap sortOrder values
    const currentSort = current.sortOrder ?? index;
    const targetSort = target.sortOrder ?? targetIndex;
    const newCurrentSort = targetSort === currentSort ? currentSort + direction : targetSort;
    const newTargetSort = currentSort;

    const updatedCurrent = { ...current, sortOrder: newCurrentSort };
    const updatedTarget = { ...target, sortOrder: newTargetSort };

    list[index] = updatedTarget;
    list[targetIndex] = updatedCurrent;

    // Sort list by sortOrder
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    setCourses(list);

    try {
      await clientApi.post('/api/admin/courses/reorder', {
        items: list.map((item, idx) => ({ id: item._id, sortOrder: idx + 1 })),
      });
      showToast('Course ordering updated');
    } catch (err) {
      showToast(err.message || 'Failed to reorder courses', 'error');
      // Revert on failure
      setCourses(initialCourses);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);

    try {
      await clientApi.delete(`/api/admin/courses/${deleteTarget._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      showToast(`Course "${deleteTarget.title}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <span className="font-mono text-xs font-bold text-navy uppercase">[FILTER]:</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, title, or category..."
            className="w-full bg-cream border border-navy px-3 py-1.5 font-mono text-xs text-navy focus:outline-none focus:ring-1 focus:ring-coral"
          />
        </div>

        <Link href="/admin/courses/new">
          <Button variant="primary" className="font-mono text-xs font-bold uppercase w-full sm:w-auto">
            + CREATE NEW COURSE
          </Button>
        </Link>
      </div>

      {/* Courses Data Table */}
      <div className="border border-navy bg-cream overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead>
            <tr className="bg-sand border-b border-navy font-mono text-[11px] text-navy">
              <th className="py-2.5 px-3 border-r border-rule-soft w-16 text-center">ORDER</th>
              <th className="py-2.5 px-3 border-r border-rule-soft w-24">CODE</th>
              <th className="py-2.5 px-3 border-r border-rule-soft">COURSE TITLE</th>
              <th className="py-2.5 px-3 border-r border-rule-soft">CATEGORY</th>
              <th className="py-2.5 px-3 border-r border-rule-soft">LEVEL / MODE</th>
              <th className="py-2.5 px-3 border-r border-rule-soft text-center">STATUS</th>
              <th className="py-2.5 px-3 border-r border-rule-soft text-center">FEATURED</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule-soft">
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center font-mono text-xs text-navy-soft">
                  NO COURSES FOUND IN REGISTRY.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course, idx) => (
                <tr key={course._id} className="hover:bg-sand/30 transition-colors">
                  {/* Reorder Arrows */}
                  <td className="py-2.5 px-3 border-r border-rule-soft text-center font-mono">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(idx, -1)}
                        disabled={idx === 0 || actionLoading}
                        title="Move Up"
                        className="px-1 text-navy hover:text-coral disabled:opacity-30 disabled:hover:text-navy"
                      >
                        ▲
                      </button>
                      <span className="text-[11px] font-bold w-4">{idx + 1}</span>
                      <button
                        onClick={() => handleMoveOrder(idx, 1)}
                        disabled={idx === filteredCourses.length - 1 || actionLoading}
                        title="Move Down"
                        className="px-1 text-navy hover:text-coral disabled:opacity-30 disabled:hover:text-navy"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {/* Course Code */}
                  <td className="py-2.5 px-3 border-r border-rule-soft font-mono font-bold text-navy">
                    {course.code || '—'}
                  </td>

                  {/* Course Title with Link to Edit */}
                  <td className="py-2.5 px-3 border-r border-rule-soft">
                    <Link
                      href={`/admin/courses/${course._id}`}
                      className="font-bold text-navy hover:text-coral underline underline-offset-2"
                    >
                      {course.title}
                    </Link>
                    <div className="text-[11px] text-navy-soft font-mono mt-0.5">
                      /{course.slug}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-3 border-r border-rule-soft font-mono">
                    {course.category || '—'}
                  </td>

                  {/* Level & Mode */}
                  <td className="py-2.5 px-3 border-r border-rule-soft font-mono text-[11px] capitalize">
                    {course.level} · {course.mode}
                  </td>

                  {/* Status with Toggle Button */}
                  <td className="py-2.5 px-3 border-r border-rule-soft text-center font-mono">
                    <button
                      onClick={() => handleToggleStatus(course)}
                      disabled={actionLoading}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                        course.status === 'published'
                          ? 'bg-coral text-navy hover:bg-coral/80'
                          : 'bg-sand text-navy-soft hover:bg-sand/80'
                      }`}
                    >
                      {course.status}
                    </button>
                  </td>

                  {/* Featured Checkbox */}
                  <td className="py-2.5 px-3 border-r border-rule-soft text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(course.featured)}
                      onChange={() => handleToggleFeatured(course)}
                      className="h-4 w-4 border-navy accent-coral cursor-pointer"
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                    <Link
                      href={`/admin/courses/${course._id}`}
                      className="text-navy hover:text-coral underline text-xs mr-3"
                    >
                      [EDIT]
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(course)}
                      className="text-error hover:text-error/80 underline text-xs"
                    >
                      [DELETE]
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <Dialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="CONFIRM DELETION"
          docRef="SYS-ACTION"
        >
          <div className="p-6 font-mono text-xs">
            <p className="text-navy mb-4 leading-relaxed font-sans">
              Are you sure you want to permanently delete course{' '}
              <span className="font-bold font-mono">&quot;{deleteTarget.title}&quot;</span>?
            </p>
            <p className="text-error mb-6 text-[11px]">
              This action is permanent and will immediately unpublish the course and delete any uploaded thumbnail image.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-rule-soft">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="text-xs"
              >
                CANCEL
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={actionLoading}
                className="bg-error text-white hover:bg-error/90 text-xs font-bold"
              >
                {actionLoading ? 'DELETING...' : 'CONFIRM DELETE'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
