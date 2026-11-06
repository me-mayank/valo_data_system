'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';

export function OverviewDashboard({ initialData = {} }) {
  const {
    totalLeads = 0,
    leadsLast7Days = 0,
    publishedCoursesCount = 0,
    campusRequestCount = 0,
    topSources = [],
    topCourses = [],
    latestLeads = [],
  } = initialData;

  // Inspect Modal State
  const [inspectTarget, setInspectTarget] = useState(null);

  // Campaign Link Generator State (FR-ADM-07)
  const [campaignName, setCampaignName] = useState('');
  const [copied, setCopied] = useState(false);

  const slug = campaignName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://datavalosystem.com';
  const trackingUrl = slug ? `${baseUrl}/?src=${slug}` : `${baseUrl}/?src=YOUR-CAMPAIGN-TAG`;

  const handleCopyLink = async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(`${baseUrl}/?src=${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

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
    <div className="space-y-8">
      {/* 1. Summary Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Total Leads */}
        <div className="border border-navy bg-cream p-5">
          <span className="font-mono text-xs uppercase text-navy-soft block">
            [METRIC 01] TOTAL LEADS
          </span>
          <div className="font-mono text-3xl font-bold text-navy mt-2">{totalLeads}</div>
          <p className="font-sans text-xs text-navy-soft mt-1">
            Registered student inquiries all-time.
          </p>
        </div>

        {/* Tile 2: 7-Day Velocity */}
        <div className="border border-navy bg-cream p-5">
          <span className="font-mono text-xs uppercase text-navy-soft block">
            [METRIC 02] LAST 7 DAYS
          </span>
          <div className="font-mono text-3xl font-bold text-navy mt-2">{leadsLast7Days}</div>
          <p className="font-sans text-xs text-navy-soft mt-1">
            New student inquiries in the past week.
          </p>
        </div>

        {/* Tile 3: Active Courses */}
        <div className="border border-navy bg-cream p-5">
          <span className="font-mono text-xs uppercase text-navy-soft block">
            [METRIC 03] ACTIVE COURSES
          </span>
          <div className="font-mono text-3xl font-bold text-navy mt-2">
            {publishedCoursesCount}
          </div>
          <p className="font-sans text-xs text-navy-soft mt-1">
            Curricula published in public catalog.
          </p>
        </div>

        {/* Tile 4: Campus Inquiries */}
        <div className="border border-navy bg-cream p-5">
          <span className="font-mono text-xs uppercase text-navy-soft block">
            [METRIC 04] CAMPUS INQUIRIES
          </span>
          <div className="font-mono text-3xl font-bold text-navy mt-2">
            {campusRequestCount}
          </div>
          <p className="font-sans text-xs text-navy-soft mt-1">
            Institutional workshop requests received.
          </p>
        </div>
      </div>

      {/* 2. Campaign QR / Tracking URL Generator (FR-ADM-07) */}
      <div className="border border-navy bg-cream p-6">
        <div className="border-b border-navy pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[10px] text-navy-soft uppercase">TOOL FR-ADM-07</span>
            <h2 className="font-mono text-base font-bold uppercase text-navy">
              Campus Campaign Tracking Link Generator
            </h2>
          </div>
          <span className="bg-sand border border-rule-soft px-2 py-0.5 font-mono text-xs text-navy">
            TAG IDENTIFIER
          </span>
        </div>

        <p className="font-sans text-xs text-navy leading-relaxed max-w-2xl mb-4">
          Generate attribution links for campus posters, workshop QR codes, or student WhatsApp circulars.
          Incoming traffic with this source parameter automatically tags all resulting student leads.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="campaignNameInput"
              className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
            >
              Institution / Event Name
            </label>
            <input
              id="campaignNameInput"
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. IIT BHU Placement 2026"
              className="w-full border border-navy px-3 py-2 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
            />
            {slug && (
              <span className="block font-mono text-[11px] text-navy-soft mt-1">
                Generated Slug: <strong className="text-navy">{slug}</strong>
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="campaignUrlPreview"
              className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
            >
              Generated Tracking URL
            </label>
            <div className="flex gap-2">
              <input
                id="campaignUrlPreview"
                type="text"
                readOnly
                value={trackingUrl}
                className="w-full border border-navy px-3 py-2 font-mono text-xs text-navy bg-sand focus:outline-none"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                disabled={!slug}
              >
                {copied ? 'COPIED!' : 'COPY'}
              </Button>
            </div>
            <span className="block font-sans text-[11px] text-navy-soft mt-1">
              Embed this URL in your QR code generator for printable posters.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Top Sources & Top Courses Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Sources */}
        <div className="border border-navy bg-cream p-5">
          <div className="border-b border-navy pb-3 mb-3 flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold uppercase text-navy">
              Top Acquisition Sources
            </h3>
            <span className="font-mono text-[11px] text-navy-soft">ATTRIBUTION</span>
          </div>

          {topSources.length === 0 ? (
            <p className="font-mono text-xs text-navy-soft py-4 text-center">
              NO SOURCE DATA RECORDED YET
            </p>
          ) : (
            <div className="space-y-2">
              {topSources.map((item, idx) => (
                <div
                  key={item.source || idx}
                  className="flex items-center justify-between p-2 border border-rule-soft bg-white font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-navy-soft font-bold">#{idx + 1}</span>
                    <span className="text-navy font-semibold">
                      {item.source || 'Direct / Organic'}
                    </span>
                  </div>
                  <span className="bg-sand border border-rule-soft px-2 py-0.5 font-bold text-navy">
                    {item.count} leads
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Courses */}
        <div className="border border-navy bg-cream p-5">
          <div className="border-b border-navy pb-3 mb-3 flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold uppercase text-navy">
              Most Demanded Curricula
            </h3>
            <span className="font-mono text-[11px] text-navy-soft">POPULARITY</span>
          </div>

          {topCourses.length === 0 ? (
            <p className="font-mono text-xs text-navy-soft py-4 text-center">
              NO COURSE INTEREST RECORDED YET
            </p>
          ) : (
            <div className="space-y-2">
              {topCourses.map((item, idx) => (
                <div
                  key={item.courseId || idx}
                  className="flex items-center justify-between p-2 border border-rule-soft bg-white font-mono text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-navy-soft font-bold">#{idx + 1}</span>
                    <span className="text-navy font-semibold truncate max-w-[200px]">
                      {item.title}
                    </span>
                  </div>
                  <span className="bg-sand border border-rule-soft px-2 py-0.5 font-bold text-navy">
                    {item.count} inquiries
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Latest 10 Leads */}
      <div className="border border-navy bg-cream p-6">
        <div className="border-b border-navy pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-mono text-base font-bold uppercase text-navy">
              Recent Lead Inflow (Latest 10)
            </h3>
            <p className="font-sans text-xs text-navy-soft mt-0.5">
              Live incoming interest queue across all landing pages and campaigns.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="font-mono text-xs uppercase font-bold text-navy hover:underline"
          >
            VIEW FULL REGISTRY →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand border-b border-navy font-mono text-xs uppercase text-navy">
                <th className="p-2 border-r border-rule-soft whitespace-nowrap">Date</th>
                <th className="p-2 border-r border-rule-soft">Student Name</th>
                <th className="p-2 border-r border-rule-soft">College</th>
                <th className="p-2 border-r border-rule-soft">Courses</th>
                <th className="p-2 border-r border-rule-soft whitespace-nowrap">Source</th>
                <th className="p-2 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {latestLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-navy-soft font-mono text-xs">
                    NO RECENT LEADS RECORDED
                  </td>
                </tr>
              ) : (
                latestLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-rule-soft hover:bg-sand/30 font-sans text-xs text-navy"
                  >
                    <td className="p-2 border-r border-rule-soft font-mono text-navy-soft whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="p-2 border-r border-rule-soft font-bold">
                      {lead.fullName}
                    </td>
                    <td className="p-2 border-r border-rule-soft">
                      {lead.college}
                    </td>
                    <td className="p-2 border-r border-rule-soft">
                      {lead.courses && lead.courses.length > 0 ? (
                        <span className="font-mono text-[11px]">
                          {lead.courses.map((c) => c.title).join(', ')}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-2 border-r border-rule-soft font-mono text-navy-soft whitespace-nowrap">
                      {lead.source || '—'}
                    </td>
                    <td className="p-2 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setInspectTarget(lead)}
                      >
                        VIEW
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

            <div className="bg-sand p-2 border border-rule-soft">
              <span className="text-navy-soft block uppercase text-[10px]">Attribution & Timestamp</span>
              <p className="text-[11px]">
                Source: <strong>{inspectTarget.source || 'Direct'}</strong>
              </p>
              <p className="text-[10px] text-navy-soft">
                Registered: {formatDate(inspectTarget.createdAt)}
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
    </div>
  );
}

export default OverviewDashboard;

