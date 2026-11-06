'use client';

import { useState } from 'react';
import { clientApi } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';

export function CampusRequestsTable({ initialData = {} }) {
  const [items, setItems] = useState(initialData.items || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [page, setPage] = useState(initialData.page || 1);
  const [limit] = useState(initialData.limit || 25);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);

  // Filters
  const [search, setSearch] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('');

  // Modals & Feedback
  const [inspectTarget, setInspectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'ok') => {
    setToast({ message, type });
  };

  const fetchRequests = async (pageToFetch = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageToFetch));
      params.set('limit', String(limit));
      if (search.trim()) params.set('search', search.trim());
      if (preferredFormat) params.set('preferredFormat', preferredFormat);

      const res = await clientApi.get(`/api/admin/campus-requests?${params.toString()}`);
      setItems(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showToast(err.message || 'Failed to fetch campus requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchRequests(1);
  };

  const handleResetFilter = () => {
    setSearch('');
    setPreferredFormat('');
    setLoading(true);
    clientApi
      .get(`/api/admin/campus-requests?page=1&limit=${limit}`)
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
      await clientApi.delete(`/api/admin/campus-requests/${deleteTarget._id}`);
      showToast(`Request for "${deleteTarget.institution}" deleted.`);
      setDeleteTarget(null);
      await fetchRequests(page);
    } catch (err) {
      showToast(err.message || 'Failed to delete request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportUrl = (() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (preferredFormat) params.set('preferredFormat', preferredFormat);
    return `/api/admin/campus-requests/export?${params.toString()}`;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label
                htmlFor="campus-search"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Search Inquiries
              </label>
              <input
                id="campus-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Institution, contact person, email, phone, designation..."
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label
                htmlFor="campus-format"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Preferred Format
              </label>
              <select
                id="campus-format"
                value={preferredFormat}
                onChange={(e) => setPreferredFormat(e.target.value)}
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              >
                <option value="">All Delivery Formats</option>
                <option value="on-campus">On-Campus Workshop</option>
                <option value="virtual">Virtual Interactive</option>
                <option value="hybrid">Hybrid Delivery</option>
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

      {/* Campus Requests Table */}
      <div className="border border-navy bg-cream overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-sand border-b border-navy font-mono text-xs uppercase text-navy">
              <th className="p-3 border-r border-rule-soft whitespace-nowrap">Submitted</th>
              <th className="p-3 border-r border-rule-soft">Institution</th>
              <th className="p-3 border-r border-rule-soft">Contact Person</th>
              <th className="p-3 border-r border-rule-soft">Email & Phone</th>
              <th className="p-3 border-r border-rule-soft whitespace-nowrap">Cohort & Format</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-navy-soft font-mono text-xs">
                  NO CAMPUS WORKSHOP REQUESTS FOUND MATCHING CRITERIA
                </td>
              </tr>
            ) : (
              items.map((req) => (
                <tr
                  key={req._id}
                  className="border-b border-rule-soft hover:bg-sand/30 font-sans text-xs text-navy transition-colors duration-75"
                >
                  <td className="p-3 border-r border-rule-soft font-mono text-navy-soft whitespace-nowrap">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="p-3 border-r border-rule-soft">
                    <div className="font-bold">{req.institution}</div>
                    {req.source && (
                      <span className="inline-block bg-sand border border-rule-soft px-1 font-mono text-[10px] text-navy-soft mt-0.5">
                        SRC: {req.source}
                      </span>
                    )}
                  </td>
                  <td className="p-3 border-r border-rule-soft">
                    <div className="font-medium">{req.contactPerson}</div>
                    <div className="text-navy-soft text-[11px]">{req.designation}</div>
                  </td>
                  <td className="p-3 border-r border-rule-soft font-mono">
                    <div>{req.email}</div>
                    <div className="text-navy-soft">{req.phone}</div>
                  </td>
                  <td className="p-3 border-r border-rule-soft font-mono text-[11px] whitespace-nowrap">
                    <div>Students: {req.approxStudents || '—'}</div>
                    <div className="text-navy-soft uppercase text-[10px]">
                      Format: {req.preferredFormat || 'Flexible'}
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setInspectTarget(req)}
                      >
                        INSPECT
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(req)}
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
          SHOWING {items.length} OF {total} INQUIRIES (PAGE {page} OF {totalPages})
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => fetchRequests(page - 1)}
          >
            ← PREVIOUS
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => fetchRequests(page + 1)}
          >
            NEXT →
          </Button>
        </div>
      </div>

      {/* Inspect Request Detail Modal */}
      {inspectTarget && (
        <Dialog
          open={Boolean(inspectTarget)}
          onOpenChange={(open) => !open && setInspectTarget(null)}
          title="CAMPUS INQUIRY RECORD"
          docRef="INST-01"
        >
          <div className="space-y-4 font-mono text-xs text-navy">
            <div className="border-b border-rule-soft pb-2">
              <span className="text-navy-soft block uppercase text-[10px]">Institution Name</span>
              <p className="text-sm font-bold font-sans">{inspectTarget.institution}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Contact Person</span>
                <p className="font-semibold">{inspectTarget.contactPerson}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Designation</span>
                <p>{inspectTarget.designation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Official Email</span>
                <p className="font-semibold">{inspectTarget.email}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Phone Helpline</span>
                <p className="font-semibold">{inspectTarget.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Approx. Students</span>
                <p className="font-bold">{inspectTarget.approxStudents || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Preferred Format</span>
                <p className="uppercase">{inspectTarget.preferredFormat || 'Flexible'}</p>
              </div>
            </div>

            <div className="border-b border-rule-soft pb-2">
              <span className="text-navy-soft block uppercase text-[10px] mb-1">
                Proposal / Message
              </span>
              <div className="bg-sand p-3 border border-rule-soft font-sans text-xs whitespace-pre-wrap leading-relaxed">
                {inspectTarget.message || 'No additional notes provided.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-rule-soft pb-2">
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Campaign Source</span>
                <p>{inspectTarget.source || 'Direct'}</p>
              </div>
              <div>
                <span className="text-navy-soft block uppercase text-[10px]">Device Type</span>
                <p>{inspectTarget.deviceType || '—'}</p>
              </div>
            </div>

            <div className="bg-sand p-2 border border-rule-soft">
              <span className="text-navy-soft block uppercase text-[10px]">Consent Verification</span>
              <p className="font-bold text-navy">
                CONSENT: {inspectTarget.consent ? 'YES' : 'NO'}
              </p>
              <p className="text-[10px] text-navy-soft">
                Received: {formatDate(inspectTarget.consentAt || inspectTarget.createdAt)}
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
          title="CONFIRM INQUIRY DELETION"
          docRef="DEL-02"
        >
          <div className="space-y-4">
            <p className="font-sans text-sm text-navy leading-relaxed">
              Are you sure you want to permanently delete the institutional inquiry from{' '}
              <strong className="font-mono">{deleteTarget.institution}</strong> ({deleteTarget.email})?
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

export default CampusRequestsTable;

