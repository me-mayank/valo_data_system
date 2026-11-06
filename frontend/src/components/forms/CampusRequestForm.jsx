'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { clientApi, ClientApiError } from '@/lib/api/client';
import { campusRequestSchema } from '@/lib/validation/campus-request';
import { getTrackedSource, getDeviceType } from '@/components/site/SourceTracker';

/**
 * Institutional Campus Workshop Request Form (FR-FORM-02)
 * @param {{
 *   onSuccess?: () => void,
 *   className?: string
 * }} props
 */
export default function CampusRequestForm({ onSuccess, className = '' }) {
  const pathname = usePathname();

  const [institution, setInstitution] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [approxStudents, setApproxStudents] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('on-campus');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  // Honeypot
  const [honeypot, setHoneypot] = useState('');

  // Status & Error Tracking
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleSlow = (e) => {
      if (isSubmitting) {
        setIsWakingUp(Boolean(e.detail?.isSlow));
      }
    };
    window.addEventListener('datavalo:slow-server', handleSlow);
    return () => {
      window.removeEventListener('datavalo:slow-server', handleSlow);
    };
  }, [isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});
    setIsWakingUp(false);

    const payload = {
      institution,
      contactPerson,
      designation,
      email,
      phone,
      approxStudents: approxStudents ? String(approxStudents).trim() : undefined,
      preferredFormat: preferredFormat || undefined,
      message: message || undefined,
      consent,
      source: getTrackedSource() || undefined,
      pagePath: pathname || undefined,
      deviceType: getDeviceType(),
      _hp: honeypot || undefined,
    };

    const validation = campusRequestSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await clientApi.post('/api/public/campus-requests', payload, {
        onSlow: () => setIsWakingUp(true),
      });

      setIsSuccess(true);
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof ClientApiError && err.fields) {
        setErrors(err.fields);
        setSubmitError(err.message || 'Please correct the highlighted errors.');
      } else {
        setSubmitError(
          err.message || 'Failed to submit workshop request. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
      setIsWakingUp(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubmitError('');
    setErrors({});
    setInstitution('');
    setContactPerson('');
    setDesignation('');
    setEmail('');
    setPhone('');
    setApproxStudents('');
    setPreferredFormat('on-campus');
    setMessage('');
    setConsent(false);
  };

  if (isSuccess) {
    return (
      <div className={`border-[2px] border-navy bg-sand p-6 md:p-8 space-y-4 ${className}`}>
        <span className="font-mono text-sm uppercase tracking-[0.08em] text-navy font-bold block">
          OK: INSTITUTIONAL ENQUIRY RECEIVED
        </span>
        <p className="font-sans text-sm text-navy leading-relaxed">
          Thank you for reaching out. We have logged your institutional workshop request. Our academic partnerships team will review your cohort size and campus schedule and follow up via official email or phone within 2 business days.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="font-mono text-xs text-navy underline uppercase tracking-[0.04em] cursor-pointer"
        >
          Submit another request →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-6 ${className}`}>
      {/* Honeypot field */}
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        aria-hidden="true"
        autoComplete="off"
      />

      {/* Global submission error */}
      {submitError && (
        <div role="alert" className="border-[1px] border-error bg-cream p-3 text-error font-mono text-xs">
          ERROR: {submitError}
        </div>
      )}

      {/* Waking-up slow server notice */}
      {isWakingUp && (
        <div role="status" className="border-[1px] border-coral bg-sand p-3 text-navy font-mono text-xs flex items-center gap-2">
          <span className="bg-coral px-1.5 py-0.5 font-bold uppercase text-[10px]">
            STATUS: WAKING UP
          </span>
          <span>Free-tier backend server is waking up. Please wait up to 60s.</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Institution Name */}
        <Input
          id="institution"
          label="College / University Name"
          index="01"
          required
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          error={errors.institution}
          placeholder="e.g. National Institute of Technology, Trichy"
        />

        {/* Contact Person & Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="contactPerson"
            label="Contact Person Name"
            index="02"
            required
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            error={errors.contactPerson}
            placeholder="e.g. Dr. S. K. Singh"
          />
          <Input
            id="designation"
            label="Designation / Role"
            index="03"
            required
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            error={errors.designation}
            placeholder="e.g. Head of Training & Placement / HOD"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="email"
            type="email"
            label="Official Email Address"
            index="04"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="e.g. tpo@nitt.edu"
          />
          <Input
            id="phone"
            type="tel"
            label="Phone / Mobile Number"
            index="05"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            placeholder="10-digit mobile number"
            helper="Enter 10-digit mobile number"
          />
        </div>

        {/* Batch Size & Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="approxStudents"
            label="Approx. Number of Students"
            index="06"
            value={approxStudents}
            onChange={(e) => setApproxStudents(e.target.value)}
            error={errors.approxStudents}
            placeholder="e.g. 120 or 100-200"
          />
          <Select
            id="preferredFormat"
            label="Preferred Workshop Format"
            index="07"
            value={preferredFormat}
            onChange={(e) => setPreferredFormat(e.target.value)}
          >
            <option value="on-campus">On-Campus (Classroom / Lab)</option>
            <option value="virtual">Virtual (Live Instructor)</option>
            <option value="hybrid">Hybrid Delivery</option>
          </Select>
        </div>

        {/* Message */}
        <Textarea
          id="message"
          label="Specific Requirements / Message"
          index="08"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={errors.message}
          placeholder="Mention target branches (CSE/IT/ECE), target semester, preferred dates, or specific platform modules (ServiceNow ITSM, Jira Agile, DevOps)..."
        />

        {/* Consent Checkbox */}
        <div className="pt-2">
          <Checkbox
            id="consent"
            required
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (errors.consent) {
                setErrors((prev) => ({ ...prev, consent: undefined }));
              }
            }}
            error={errors.consent}
            label={
              <span>
                I represent an academic institution and agree to be contacted by Data Valo System regarding campus workshops and training. I have read the{' '}
                <Link href="/privacy" target="_blank" className="underline hover:text-coral font-medium">
                  Privacy Policy
                </Link>.
              </span>
            }
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting
          ? isWakingUp
            ? 'Waking up & submitting...'
            : 'Submitting request...'
          : 'Submit institutional request →'}
      </Button>
    </form>
  );
}

