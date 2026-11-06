'use client';

import { useState } from 'react';
import { clientApi } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

export function LeadsTable({ initialData = {} }) {
  const [items, setItems] = useState(initialData.items || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [page, setPage] = useState(initialData.page || 1);
  const [limit] = useState(initialData.limit || 25);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);

  // Filters
  const [search, setSearch] = useState('');
  const [formVariant, setFormVariant] = useState('');
  const [source, setSource] = useState('');
  const [sort, setSort] = useState('-createdAt');

  // Modals & Feedback
  const [inspectTarget, setInspectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'ok') => {
    setToast({ message, type });
  };

  const fetchLeads = async (pageToFetch = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageToFetch));
      params.set('limit', String(limit));
      params.set('sort', sort);
      if (search.trim()) params.set('search', search.trim());
      if (formVariant) params.set('formVariant', formVariant);
      if (source.trim()) params.set('source', source.trim());

      const res = await clientApi.get(`/api/admin/leads?${params.toString()}`);
      setItems(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showToast(err.message || 'Failed to fetch student leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleResetFilter = () => {
    setSearch('');
    setFormVariant('');
    setSource('');
    setSort('-createdAt');
    // Fetch page 1 with reset params
    setLoading(true);
    clientApi
      .get(`/api/admin/leads?page=1&limit=${limit}&sort=-createdAt`)
      .then((res) => {
        setItems(res.items || []);
        setTotal(res.total || 0);
        setPage(1);
        setTotalPages(res.totalPages || 1);
      })
      .catch((err) => showToast(err.message || 'Failed to reset', 'error'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await clientApi.delete(`/api/admin/leads/${deleteTarget._id}`);
      showToast(`Lead for ${deleteTarget.fullName} deleted successfully.`);
      setDeleteTarget(null);
      await fetchLeads(page);
    } catch (err) {
      showToast(err.message || 'Failed to delete lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportUrl = (() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (formVariant) params.set('formVariant', formVariant);
    if (source.trim()) params.set('source', source.trim());
    return `/api/admin/leads/export?${params.toString()}`;
  })();

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toISOString().replace('T', ' ').slice(0, 16);
    } catch {
      return isoStr;
    }
  };

  return (
    <div>
      {/* Toast Notice */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Filter and Action Bar */}
      <div className="border border-navy bg-cream p-4 mb-6">
        <form onSubmit={handleApplyFilter} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label
                htmlFor="lead-search"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Search Registry
              </label>
              <input
                id="lead-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, phone, college..."
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label
                htmlFor="lead-source"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Campaign Source
              </label>
              <input
                id="lead-source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. qr-iit-bhu"
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label
                htmlFor="lead-variant"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Capture Form
              </label>
              <select
                id="lead-variant"
                value={formVariant}
                onChange={(e) => setFormVariant(e.target.value)}
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              >
                <option value="">All Form Types</option>
                <option value="popup">Popup Modal</option>
                <option value="contact">Contact Page Form</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="lead-sort"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Sort Order
              </label>
              <select
                id="lead-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="fullName">Full Name (A–Z)</option>
                <option value="college">College (A–Z)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rule-soft">
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" variant="primary" disabled={loading}>
                {loading ? 'FILTERING...' : 'APPLY FILTERS'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleResetFilter}
                disabled={loading}
              >
                RESET
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={exportUrl}
                download
                className="inline-flex items-center justify-center font-mono text-xs font-bold uppercase tracking-wider px-3 py-2 border border-navy bg-sand text-navy hover:bg-sand-dark transition-colors duration-75 cursor-pointer"
              >
                [ EXPORT CSV ]
              </a>
            </div>
          </div>
        </form>
      </div>

      {/* Leads Table */}
      <div className="border border-navy bg-cream overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-sand border-b border-navy font-mono text-xs uppercase text-navy">
              <th className="p-3 border-r border-rule-soft whitespace-nowrap">Reg Date</th>
              <th className="p-3 border-r border-rule-soft">Student Name</th>
              <th className="p-3 border-r border-rule-soft">Contact</th>
              <th className="p-3 border-r border-rule-soft">Institution</th>
              <th className="p-3 border-r border-rule-soft">Interested Courses</th>
              <th className="p-3 border-r border-rule-soft whitespace-nowrap">Source Tag</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-navy-soft font-mono text-xs">
                  NO STUDENT LEADS FOUND MATCHING CRITERIA
                </td>
              </tr>
            ) : (
              items.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-b border-rule-soft hover:bg-sand/30 font-sans text-xs text-navy transition-colors duration-75"
                >
                  <td className="p-3 border-r border-rule-soft font-mono text-navy-soft whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="p-3 border-r border-rule-soft">
                    <div className="font-bold">{lead.fullName}</div>
                    <span className="inline-block bg-sand border border-rule-soft px-1 font-mono text-[10px] text-navy-soft uppercase mt-0.5">
                      {lead.formVariant || 'popup'}
                    </span>
                  </td>
                  <td className="p-3 border-r border-rule-soft font-mono">
                    <div>{lead.email}</div>
                    <div className="text-navy-soft">{lead.phone}</div>
                  </td>
                  <td className="p-3 border-r border-rule-soft">
                    <div className="font-medium">{lead.college}</div>
                    <div className="text-navy-soft font-mono text-[11px]">{lead.courseYear}</div>
                  </td>
                  <td className="p-3 border-r border-rule-soft">
                    <div className="flex flex-wrap gap-1">
                      {lead.courses && lead.courses.length > 0 ? (
                        lead.courses.map((c) => (
                          <span
                            key={c.id}
                            className="bg-sand border border-rule-soft px-1.5 py-0.5 font-mono text-[10px] text-navy"
                          >
                            {c.title}
                          </span>
                        ))
                      ) : (
                        <span className="font-mono text-[11px] text-navy-soft">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border-r border-rule-soft font-mono text-navy-soft whitespace-nowrap">
                    {lead.source ? (
                      <span className="bg-sand px-1.5 py-0.5 border border-rule-soft text-navy">
                        {lead.source}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setInspectTarget(lead)}
                      >
                        INSPECT
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(lead)}
                      >
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 py-2 border-t border-navy">
        <div className="font-mono text-xs text-navy-soft">
          SHOWING {items.length} OF {total} LEADS (PAGE {page} OF {totalPages})
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => fetchLeads(page - 1)}
          >
            ← PREVIOUS
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => fetchLeads(page + 1)}
          >
            NEXT →
          </Button>
        </div>
      </div>

      {/* Inspect Lead Detail Modal */}
      {inspectTarget && (
        <Dialog
          open={Boolean(inspectTarget)}
          onOpenChange={(open) => !open && setInspectTarget(null)}
          title="STUDENT LEAD RECORD"
          docRef="REG-01"
        >
          <div className="space-y-4 font-mono text-xs text-navy">
            <div className="border-b border-rule-soft pb-2">
              <span className="text-navy-soft block uppercase text-[10px]">Student Full Name</span>
              <p className="text-sm font-bold">{inspectTarget.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Email Address</span>
                <p className="font-semibold">{inspectTarget.email}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Phone Number</span>
                <p className="font-semibold">{inspectTarget.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">College / Institute</span>
                <p className="font-sans font-medium">{inspectTarget.college}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Course & Year</span>
                <p>{inspectTarget.courseYear}</p>
              </div>
            </div>

            <div className="border-b border-rule-soft pb-2">
              <span className="text-navy-soft block uppercase text-[10px] mb-1">
                Interested Courses
              </span>
              <div className="flex flex-wrap gap-1.5">
                {inspectTarget.courses && inspectTarget.courses.length > 0 ? (
                  inspectTarget.courses.map((c) => (
                    <span
                      key={c.id}
                      className="bg-sand border border-rule-soft px-2 py-0.5 text-navy font-semibold"
                    >
                      {c.title}
                    </span>
                  ))
                ) : (
                  <span className="text-navy-soft">None recorded</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">City</span>
                <p>{inspectTarget.city || '—'}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Mode</span>
                <p>{inspectTarget.preferredMode || '—'}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Skill Level</span>
                <p>{inspectTarget.skillLevel || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Campaign Source</span>
                <p>{inspectTarget.source || '—'}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Form Variant</span>
                <p>{inspectTarget.formVariant || 'popup'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Page Path</span>
                <p className="break-all">{inspectTarget.pagePath || '—'}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Device Type</span>
                <p>{inspectTarget.deviceType || '—'}</p>
              </div>
            </div>

            <div className="bg-sand p-2 border border-rule-soft">
              <span className="text-navy-soft block uppercase text-[10px]">Legal Consent</span>
              <p className="font-bold text-navy">
                ACCEPTED: {inspectTarget.consent ? 'YES' : 'NO'}
              </p>
              <p className="text-[10px] text-navy-soft">
                Consent Timestamp: {formatDate(inspectTarget.consentAt)}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectTarget(null)}
              >
                CLOSE
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Dialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="CONFIRM DELETION"
          docRef="DEL-01"
        >
          <div className="space-y-4">
            <p className="font-sans text-sm text-navy leading-relaxed">
              Are you sure you want to permanently delete the student lead for{' '}
              <strong className="font-mono">{deleteTarget.fullName}</strong> ({deleteTarget.email})?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-rule-soft">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={loading}
              >
                CANCEL
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'DELETING...' : 'CONFIRM DELETE'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default LeadsTable;

