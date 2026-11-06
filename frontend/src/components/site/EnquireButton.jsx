'use client';

import Button from '@/components/ui/Button';
import { openLeadForm } from '@/lib/popup/events';

/**
 * Enquire CTA button that triggers the modal lead form with course preselected (FR-POP-07).
 *
 * @param {{
 *   courseId: string,
 *   courseSlug?: string,
 *   className?: string
 * }} props
 */
export default function EnquireButton({ courseId, className = '' }) {
  const handleClick = () => {
    openLeadForm({ courseId });
  };

  return (
    <Button
      type="button"
      variant="primary"
      onClick={handleClick}
      className={`w-full text-center py-3 ${className}`}
    >
      Enquire about this course →
    </Button>
  );
}

