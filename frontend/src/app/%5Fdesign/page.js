'use client';

// Hidden dev route: /_design
// Shows every UI component in all states.
// Not linked from public navigation — for development review only.
// FR: Phase 1 task 8

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Tag from '@/components/ui/Tag';
import Accordion from '@/components/ui/Accordion';
import Dialog from '@/components/ui/Dialog';
import Toast from '@/components/ui/Toast';
import Table from '@/components/ui/Table';
import Grid, { GridCell } from '@/components/site/Grid';
import SectionHeader from '@/components/site/SectionHeader';
import SpecList from '@/components/site/SpecList';
import CourseCell from '@/components/site/CourseCell';
import TypeTile from '@/components/site/TypeTile';

const SAMPLE_ACCORDION = [
  {
    id: 'm1',
    title: 'Introduction to ServiceNow',
    content: (
      <ul className="font-sans text-sm text-navy space-y-1 list-none p-0 m-0">
        <li>What is ServiceNow?</li>
        <li>Navigating the platform</li>
        <li>ITSM fundamentals</li>
      </ul>
    ),
  },
  {
    id: 'm2',
    title: 'Incident Management',
    content: (
      <ul className="font-sans text-sm text-navy space-y-1 list-none p-0 m-0">
        <li>Incident lifecycle</li>
        <li>SLAs and escalations</li>
        <li>Reporting</li>
      </ul>
    ),
  },
];

const TABLE_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'source', label: 'Source' },
  { key: 'date', label: 'Date' },
];

const TABLE_ROWS = [
  { name: 'Aarav Sharma', email: 'aarav@example.com', source: 'iit-bhu', date: '2026-11-01' },
  { name: 'Priya Nair', email: 'priya@example.com', source: 'nit-trichy', date: '2026-11-02' },
];

export default function DesignPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [gridOverlay, setGridOverlay] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  return (
    <div className="min-h-screen bg-cream text-navy">
      {/* Grid overlay toggle — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[9998] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setGridOverlay((v) => !v)}
          className="font-mono text-[12px] uppercase tracking-[0.08em] border-[2px] border-navy bg-cream px-3 py-2 cursor-pointer hover:bg-sand transition-colors duration-[100ms]"
        >
          {gridOverlay ? '[ GRID ON ]' : '[ GRID OFF ]'}
        </button>
      </div>

      {/* Grid overlay — visual column guide */}
      {gridOverlay && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[9990] pointer-events-none"
        >
          <div className="max-w-[1200px] mx-auto h-full grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="border-x-[1px] h-full"
                style={{ borderColor: 'rgba(242,84,61,0.2)', backgroundColor: 'rgba(242,84,61,0.04)' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toast (if any) */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-16">

        {/* Page header */}
        <header className="border-b-[2px] border-navy pb-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy-soft">
            DATA VALO SYSTEM / DOC DV-DESIGN-01
          </p>
          <h1 className="font-mono font-semibold text-[2rem] mt-2">
            Design system: component reference.
          </h1>
        </header>

        {/* ── COLOURS ──────────────────────────────────────────── */}
        <section>
          <SectionHeader index="01" label="Colour tokens" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-0 border-[1px] border-navy">
            {[
              { token: '--color-navy', label: 'NAVY', textClass: 'text-cream' },
              { token: '--color-cream', label: 'CREAM', textClass: 'text-navy border-[1px] border-navy' },
              { token: '--color-sand', label: 'SAND', textClass: 'text-navy' },
              { token: '--color-coral', label: 'CORAL', textClass: 'text-navy' },
              { token: '--color-navy-soft', label: 'NAVY-SOFT', textClass: 'text-cream' },
              { token: '--color-rule-soft', label: 'RULE-SOFT', textClass: 'text-navy' },
              { token: '--color-error', label: 'ERROR', textClass: 'text-cream' },
              { token: '--color-white', label: 'WHITE', textClass: 'text-navy border-[1px] border-navy' },
            ].map(({ token, label, textClass }) => (
              <div
                key={token}
                className={`h-20 flex flex-col justify-end p-2 border-[1px] border-navy -m-px ${textClass}`}
                style={{ backgroundColor: `var(${token})` }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] block">{label}</span>
                <span className="font-mono text-[10px] opacity-70">{token}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── TYPOGRAPHY ─────────────────────────────────────── */}
        <section>
          <SectionHeader index="02" label="Typography" />
          <div className="mt-4 border-[1px] border-navy">
            {[
              { el: 'h1', text: 'H1 — Learn the tools real software teams use.', style: { fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: 1.2 } },
              { el: 'h2', text: 'H2 — Hands-on training.', style: { fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '2.5rem', lineHeight: 1.2 } },
              { el: 'h3', text: 'H3 — ServiceNow, Jira, and more.', style: { fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.2 } },
              { el: 'p', text: 'Body (IBM Plex Sans 16px) — Duration: 6 weeks. Format: online and offline. Audience: college students in 2nd to 4th year.', style: { fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.5 } },
              { el: 'span', text: 'LABEL: MONO UPPERCASE 12PX / LETTER-SPACING 0.08EM', style: { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' } },
              { el: 'span', text: 'Mono 14px — button text, table text', style: { fontFamily: 'var(--font-mono)', fontSize: '0.875rem' } },
            ].map(({ el: El, text, style }, i, arr) => (
              <div
                key={i}
                className={`px-4 py-3 ${i < arr.length - 1 ? 'border-b-[1px] border-rule-soft' : ''}`}
              >
                <El style={style}>{text}</El>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUTTONS ─────────────────────────────────────────── */}
        <section>
          <SectionHeader index="03" label="Buttons" />
          <div className="mt-4 border-[1px] border-navy">
            <div className="flex flex-wrap gap-4 p-6 border-b-[1px] border-rule-soft bg-cream">
              <Button variant="primary">Explore courses →</Button>
              <Button variant="secondary">Register interest</Button>
              <Button variant="primary" disabled>Primary (disabled)</Button>
              <Button variant="secondary" disabled>Secondary (disabled)</Button>
            </div>
            <div className="flex flex-wrap gap-4 p-6 bg-navy">
              <p className="font-mono text-[12px] text-rule-soft uppercase tracking-[0.08em] w-full mb-2">
                On navy background
              </p>
              <Button variant="primary">Explore courses →</Button>
              <Button variant="secondary" className="border-cream text-cream hover:bg-navy-soft">Register interest</Button>
            </div>
          </div>
        </section>

        {/* ── FORM INPUTS ─────────────────────────────────────── */}
        <section>
          <SectionHeader index="04" label="Form inputs" />
          <div className="mt-4 grid md:grid-cols-2 gap-0 border-[1px] border-navy">
            <div className="p-6 border-b-[1px] md:border-b-0 md:border-r-[1px] border-rule-soft space-y-4">
              <Input
                id="name-ok"
                label="Full name"
                index="01"
                required
                placeholder="Aarav Sharma"
              />
              <Input
                id="name-err"
                label="Full name"
                index="02"
                required
                error="Name must be 2 to 80 characters."
                defaultValue="A"
              />
              <Textarea
                id="msg"
                label="Message"
                index="03"
                placeholder="Tell us about your interest…"
              />
            </div>
            <div className="p-6 space-y-4">
              <Select id="mode" label="Preferred mode" index="04" required>
                <option value="">Select an option</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="either">Either</option>
              </Select>
              <Checkbox
                id="consent"
                label={<>I agree to be contacted by Data Valo System. I have read the <a href="/privacy" className="underline">Privacy Policy</a>.</>}
                required
              />
              <Checkbox
                id="consent-err"
                label="Consent (error state)"
                required
                error="You must agree to continue."
              />
            </div>
          </div>
        </section>

        {/* ── TAGS ────────────────────────────────────────────── */}
        <section>
          <SectionHeader index="05" label="Tags / filter chips" />
          <div className="mt-4 p-4 border-[1px] border-navy flex flex-wrap gap-2">
            {['ITSM', 'PROJECT MANAGEMENT', 'DevOps', 'ServiceNow', 'Jira'].map((t) => (
              <Tag
                key={t}
                selected={selectedTag === t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
              >
                {t}
              </Tag>
            ))}
          </div>
        </section>

        {/* ── ACCORDION ────────────────────────────────────────── */}
        <section>
          <SectionHeader index="06" label="Accordion (syllabus)" />
          <div className="mt-4">
            <Accordion items={SAMPLE_ACCORDION} />
          </div>
        </section>

        {/* ── DIALOG ───────────────────────────────────────────── */}
        <section>
          <SectionHeader index="07" label="Dialog (popup)" />
          <div className="mt-4 p-4 border-[1px] border-navy flex gap-4 flex-wrap">
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              Open popup →
            </Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="REGISTER INTEREST"
              docRef="FORM DV-01"
            >
              <div className="space-y-4">
                <Input id="d-name" label="Full name" index="01" required placeholder="Aarav Sharma" />
                <Input id="d-email" label="Email" index="02" required type="email" placeholder="aarav@college.edu" />
                <Checkbox
                  id="d-consent"
                  label="I agree to be contacted by Data Valo System."
                  required
                />
                <Button variant="primary" className="w-full justify-center">
                  Submit →
                </Button>
              </div>
            </Dialog>
          </div>
        </section>

        {/* ── TOAST ────────────────────────────────────────────── */}
        <section>
          <SectionHeader index="08" label="Toast notifications" />
          <div className="mt-4 p-4 border-[1px] border-navy flex gap-4 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => setToast({ message: 'Form submitted successfully.', type: 'ok' })}
            >
              Show OK toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => setToast({ message: 'Server error. Please try again.', type: 'error' })}
            >
              Show ERROR toast
            </Button>
          </div>
        </section>

        {/* ── TABLE ────────────────────────────────────────────── */}
        <section>
          <SectionHeader index="09" label="Table (admin)" />
          <div className="mt-4">
            <Table
              caption="Sample leads table"
              columns={TABLE_COLUMNS}
              rows={TABLE_ROWS}
            />
          </div>
        </section>

        {/* ── SPEC LIST ────────────────────────────────────────── */}
        <section>
          <SectionHeader index="10" label="Spec list (key/value rows)" />
          <div className="mt-4 max-w-[520px]">
            <SpecList
              items={[
                { key: 'PROGRAM', value: 'Industry tools training' },
                { key: 'TOOLS', value: 'ServiceNow, Jira, and more' },
                { key: 'FORMAT', value: 'Online / Offline' },
                { key: 'AUDIENCE', value: 'College students' },
                { key: 'STATUS', value: 'Registering interest' },
              ]}
            />
          </div>
        </section>

        {/* ── COURSE CELL ─────────────────────────────────────── */}
        <section>
          <SectionHeader index="11" label="Course cells" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-0 border-[1px] border-navy">
            <CourseCell
              code="SN-101"
              title="ServiceNow Fundamentals"
              shortDescription="Learn to navigate the ServiceNow platform and handle incidents."
              duration="6 weeks"
              mode="online"
              level="beginner"
              tools={['ServiceNow', 'ITSM']}
              slug="servicenow-fundamentals"
            />
            <CourseCell
              code="JR-201"
              title="Jira for Agile Teams"
              shortDescription="Master Jira boards, sprints, and project tracking."
              duration="4 weeks"
              mode="hybrid"
              level="intermediate"
              tools={['Jira', 'Confluence']}
              slug="jira-agile-teams"
            />
            <CourseCell
              title="DevOps Essentials"
              shortDescription="Git workflows, CI/CD basics, and collaborative tooling."
              duration="8 weeks"
              mode="offline"
              level="intermediate"
              tools={['Git', 'Jenkins']}
              slug="devops-essentials"
            />
          </div>
        </section>

        {/* ── TYPE TILE ────────────────────────────────────────── */}
        <section>
          <SectionHeader index="12" label="Typographic tile (course thumbnail fallback)" />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-0 border-[1px] border-navy max-w-[640px]">
            <TypeTile code="SN-101" tool="ServiceNow" />
            <TypeTile code="JR-201" tool="Jira" />
            <TypeTile code="DV-301" tool="DevOps" />
            <TypeTile />
          </div>
        </section>

        {/* ── GRID DEMO ─────────────────────────────────────────── */}
        <section>
          <SectionHeader index="13" label="12-column grid (edge-to-edge cells)" meta="DESKTOP" />
          <div className="mt-4">
            <Grid>
              {Array.from({ length: 12 }).map((_, i) => (
                <GridCell key={i} className="p-3">
                  <span className="font-mono text-[12px] text-navy-soft">COL {i + 1}</span>
                </GridCell>
              ))}
            </Grid>
          </div>
        </section>

        {/* Footer rule */}
        <div className="border-t-[2px] border-navy pt-4 pb-8">
          <p className="font-mono text-[12px] text-navy-soft uppercase tracking-[0.08em]">
            DATA VALO SYSTEM / DOC DV-DESIGN-01 / PHASE 1
          </p>
        </div>

      </div>
    </div>
  );
}

