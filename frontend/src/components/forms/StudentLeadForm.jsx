'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { clientApi, ClientApiError } from '@/lib/api/client';
import { studentLeadSchema } from '@/lib/validation/lead';
import { getTrackedSource, getDeviceType } from '@/components/site/SourceTracker';
import { markLeadSubmitted } from '@/lib/popup/events';

/**
 * @param {{
 *   variant?: 'popup' | 'full' | 'contact',
 *   initialCourseId?: string,
 *   availableCourses?: Array<{ _id: string, code?: string, title: string, duration?: string }>,
 *   onSuccess?: () => void,
 *   className?: string
 * }} props
 */
export default function StudentLeadForm({
  variant = 'contact',
  initialCourseId = '',
  availableCourses = [],
  onSuccess,
  className = '',
}) {
  const pathname = usePathname();

  // Form State
  const [fetchedCourses, setFetchedCourses] = useState([]);
  const courses = availableCourses.length > 0 ? availableCourses : fetchedCourses;
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState(
    initialCourseId ? [initialCourseId] : []
  );
  const [consent, setConsent] = useState(false);

  // Optional Contact Page Fields
  const [city, setCity] = useState('');
  const [preferredMode, setPreferredMode] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [heardFrom, setHeardFrom] = useState('');

  // Honeypot
  const [honeypot, setHoneypot] = useState('');

  // Status & Error Tracking
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch published courses if none passed in props
  useEffect(() => {
    if (availableCourses.length === 0) {
      clientApi
        .get('/api/public/courses')
        .then((data) => {
          if (Array.isArray(data)) {
            setFetchedCourses(data);
          }
        })
        .catch(() => {
          // Graceful fallback
        });
    }
  }, [availableCourses.length]);

  // Listen to slow server events for waking-up notification
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

  const toggleCourse = (id) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (errors.interestedCourseIds) {
      setErrors((prev) => ({ ...prev, interestedCourseIds: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});
    setIsWakingUp(false);

    const payload = {
      fullName,
      phone,
      email,
      college,
      courseYear,
      interestedCourseIds: selectedCourseIds,
      consent,
      city: city || undefined,
      preferredMode: preferredMode || undefined,
      skillLevel: skillLevel || undefined,
      heardFrom: heardFrom || undefined,
      source: getTrackedSource() || undefined,
      pagePath: pathname || undefined,
      deviceType: getDeviceType(),
      formVariant: variant === 'popup' ? 'popup' : 'contact',
      _hp: honeypot || undefined,
    };

    // Client Zod validation
    const validation = studentLeadSchema.safeParse(payload);
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
      await clientApi.post('/api/public/leads', payload, {
        onSlow: () => setIsWakingUp(true),
      });

      markLeadSubmitted();
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
          err.message || 'Failed to submit registration. Please try again.'
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
    setFullName('');
    setPhone('');
    setEmail('');
    setCollege('');
    setCourseYear('');
    setSelectedCourseIds(initialCourseId ? [initialCourseId] : []);
    setConsent(false);
    setCity('');
    setPreferredMode('');
    setSkillLevel('');
    setHeardFrom('');
  };

  if (isSuccess) {
    return (
      <div className={`border-[2px] border-navy bg-sand p-6 space-y-4 ${className}`}>
        <span className="font-mono text-sm uppercase tracking-[0.08em] text-navy font-bold block">
          OK: REGISTRATION RECEIVED
        </span>
        <p className="font-sans text-sm text-navy leading-relaxed">
          Thank you for registering your interest! We have logged your details. A program coordinator will reach out via WhatsApp/email with cohort dates, syllabus details, and orientation schedules.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="font-mono text-xs text-navy underline uppercase tracking-[0.04em] cursor-pointer"
        >
          Submit another response →
        </button>
      </div>
    );
  }

  const isPopup = variant === 'popup';

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-6 ${className}`}>
      {/* Honeypot field (hidden from assistive tech and visual layout) */}
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
        {/* Full Name */}
        <Input
          id="fullName"
          label="Full name"
          index="01"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="e.g. Aarav Sharma"
        />

        {/* Contact Info (Row on tablet/desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="phone"
            type="tel"
            label="Phone / WhatsApp"
            index="02"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            placeholder="10-digit mobile number"
            helper="Enter 10-digit Indian mobile number"
          />
          <Input
            id="email"
            type="email"
            label="Email address"
            index="03"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="e.g. aarav@college.edu"
          />
        </div>

        {/* Academic Info (Row on tablet/desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="college"
            label="College name"
            index="04"
            required
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            error={errors.college}
            placeholder="e.g. IIT (BHU) Varanasi"
          />
          <Input
            id="courseYear"
            label="Course and year"
            index="05"
            required
            value={courseYear}
            onChange={(e) => setCourseYear(e.target.value)}
            error={errors.courseYear}
            placeholder="e.g. B.Tech CSE, 3rd year"
          />
        </div>

        {/* Courses of Interest Checkboxes */}
        <div className="space-y-2 pt-2">
          <label className="font-mono text-[12px] uppercase tracking-[0.08em] text-navy block">
            <span className="text-navy-soft mr-2">06</span>
            COURSES INTERESTED IN{' '}
            <span className="text-navy-soft font-mono text-[12px]">REQUIRED (AT LEAST 1)</span>
          </label>
          {errors.interestedCourseIds && (
            <div role="alert" className="font-mono text-xs text-error">
              ERROR: {errors.interestedCourseIds}
            </div>
          )}
          <div className="border-[1px] border-navy p-3 bg-cream space-y-2 max-h-56 overflow-y-auto">
            {courses.length === 0 ? (
              <p className="font-mono text-xs text-navy-soft p-2">
                Loading available programs...
              </p>
            ) : (
              courses.map((course) => (
                <label
                  key={course._id}
                  className="flex items-center gap-3 p-2 hover:bg-sand cursor-pointer transition-colors duration-[100ms] select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(course._id)}
                    onChange={() => toggleCourse(course._id)}
                    className="w-4 h-4 accent-navy cursor-pointer"
                  />
                  <span className="font-sans text-sm text-navy">
                    {course.code && <strong className="font-mono font-semibold mr-1">[{course.code}]</strong>}
                    {course.title} {course.duration ? `(${course.duration})` : ''}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Extended Fields for Contact Page Variant (PRD §7.2) */}
        {!isPopup && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Input
                id="city"
                label="City"
                index="07"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={errors.city}
                placeholder="e.g. Varanasi"
              />

              <Select
                id="preferredMode"
                label="Preferred mode"
                index="08"
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value)}
              >
                <option value="">Any mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Either">Either</option>
              </Select>

              <Select
                id="skillLevel"
                label="Current skill level"
                index="09"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner (New to tools)</option>
                <option value="Some exposure">Some exposure</option>
                <option value="Intermediate">Intermediate</option>
              </Select>
            </div>

            <Select
              id="heardFrom"
              label="How did you hear about us?"
              index="10"
              value={heardFrom}
              onChange={(e) => setHeardFrom(e.target.value)}
            >
              <option value="">Select source</option>
              <option value="Poster/QR">Poster / QR Code</option>
              <option value="Friend">Friend / Classmate</option>
              <option value="Instagram">Instagram</option>
              <option value="College event">College Event / Talk</option>
              <option value="Other">Other</option>
            </Select>
          </>
        )}

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
                I agree to be contacted by Data Valo System regarding courses and workshops. I have read the{' '}
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
            : 'Submitting registration...'
          : 'Submit registration →'}
      </Button>
    </form>
  );
}
