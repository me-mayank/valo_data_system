'use client';

import { useState } from 'react';
import { clientApi } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export function SettingsForm({ initialSettings = {} }) {
  const [formData, setFormData] = useState({
    popupEnabled: initialSettings.popupEnabled ?? true,
    popupDelaySeconds: initialSettings.popupDelaySeconds ?? 8,
    popupScrollPercent: initialSettings.popupScrollPercent ?? 40,
    popupReappearSeconds: initialSettings.popupReappearSeconds ?? 120,
    popupMaxDismissals: initialSettings.popupMaxDismissals ?? 5,
    contactEmail: initialSettings.contactEmail || '',
    contactPhone: initialSettings.contactPhone || '',
    instagramUrl: initialSettings.instagramUrl || '',
    linkedinUrl: initialSettings.linkedinUrl || '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'ok') => {
    setToast({ message, type });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        popupEnabled: Boolean(formData.popupEnabled),
        popupDelaySeconds: Number(formData.popupDelaySeconds),
        popupScrollPercent: Number(formData.popupScrollPercent),
        popupReappearSeconds: Number(formData.popupReappearSeconds),
        popupMaxDismissals: Number(formData.popupMaxDismissals),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        instagramUrl: formData.instagramUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
      };

      const res = await clientApi.put('/api/admin/settings', payload);
      if (res) {
        setFormData((prev) => ({
          ...prev,
          ...res,
        }));
      }
      showToast('Settings saved successfully. Cache revalidated.');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Section A: Popup Engine Thresholds */}
        <div className="border border-navy bg-cream p-6">
          <div className="border-b border-navy pb-3 mb-4">
            <span className="font-mono text-[10px] text-navy-soft uppercase">CONFIG GROUP A</span>
            <h2 className="font-mono text-base font-bold uppercase text-navy">
              Lead Popup Engine Configuration
            </h2>
            <p className="font-sans text-xs text-navy-soft mt-1">
              Control automated registration dialog triggers, scroll thresholds, dismissal cooldowns, and anti-fatigue caps.
            </p>
          </div>

          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center gap-3 p-3 bg-white border border-navy">
              <input
                id="popupEnabled"
                type="checkbox"
                checked={formData.popupEnabled}
                onChange={(e) => handleChange('popupEnabled', e.target.checked)}
                className="w-4 h-4 accent-coral cursor-pointer"
              />
              <label
                htmlFor="popupEnabled"
                className="font-mono text-xs uppercase text-navy font-bold cursor-pointer select-none"
              >
                Lead Capture Popup Enabled Globally
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="popupDelaySeconds"
                  className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
                >
                  Time Trigger Delay (Seconds)
                </label>
                <input
                  id="popupDelaySeconds"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.popupDelaySeconds}
                  onChange={(e) => handleChange('popupDelaySeconds', e.target.value)}
                  className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
                <span className="block font-sans text-[11px] text-navy-soft mt-1">
                  Seconds on page before registration popup fires (default: 8s).
                </span>
              </div>

              <div>
                <label
                  htmlFor="popupScrollPercent"
                  className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
                >
                  Scroll Trigger Depth (Percentage)
                </label>
                <input
                  id="popupScrollPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.popupScrollPercent}
                  onChange={(e) => handleChange('popupScrollPercent', e.target.value)}
                  className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
                <span className="block font-sans text-[11px] text-navy-soft mt-1">
                  Page scroll percentage before popup triggers (default: 40%).
                </span>
              </div>

              <div>
                <label
                  htmlFor="popupReappearSeconds"
                  className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
                >
                  Dismissal Cooldown (Seconds)
                </label>
                <input
                  id="popupReappearSeconds"
                  type="number"
                  min="0"
                  max="3600"
                  value={formData.popupReappearSeconds}
                  onChange={(e) => handleChange('popupReappearSeconds', e.target.value)}
                  className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
                <span className="block font-sans text-[11px] text-navy-soft mt-1">
                  Cooldown interval after closing modal before next attempt (default: 120s).
                </span>
              </div>

              <div>
                <label
                  htmlFor="popupMaxDismissals"
                  className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
                >
                  Fatigue Threshold (Max Dismissals)
                </label>
                <input
                  id="popupMaxDismissals"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.popupMaxDismissals}
                  onChange={(e) => handleChange('popupMaxDismissals', e.target.value)}
                  className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
                  required
                />
                <span className="block font-sans text-[11px] text-navy-soft mt-1">
                  Dismissals before permanently demoting to sticky button (default: 5).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Contact & Brand Channels */}
        <div className="border border-navy bg-cream p-6">
          <div className="border-b border-navy pb-3 mb-4">
            <span className="font-mono text-[10px] text-navy-soft uppercase">CONFIG GROUP B</span>
            <h2 className="font-mono text-base font-bold uppercase text-navy">
              Public Contact & Identity Details
            </h2>
            <p className="font-sans text-xs text-navy-soft mt-1">
              Contact addresses and social URLs displayed in the public header, footer, and inquiry responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contactEmail"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Official Admissions Email
              </label>
              <input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="info@datavalosystem.com"
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label
                htmlFor="contactPhone"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Direct Phone Helpline
              </label>
              <input
                id="contactPhone"
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label
                htmlFor="instagramUrl"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                Instagram Channel URL
              </label>
              <input
                id="instagramUrl"
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/datavalosystem"
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>

            <div>
              <label
                htmlFor="linkedinUrl"
                className="block font-mono text-xs uppercase text-navy font-semibold mb-1"
              >
                LinkedIn Page URL
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/company/datavalo"
                className="w-full border border-navy px-3 py-1.5 font-mono text-xs text-navy bg-white focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between p-4 border border-navy bg-sand">
          <span className="font-mono text-xs text-navy-soft">
            Changes take effect immediately on public frontend via revalidation.
          </span>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'SAVING CONFIGURATION...' : 'SAVE SETTINGS'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SettingsForm;

