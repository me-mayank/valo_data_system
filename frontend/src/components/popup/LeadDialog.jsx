'use client';

import Dialog from '@/components/ui/Dialog';
import StudentLeadForm from '@/components/forms/StudentLeadForm';

/**
 * Lead capture modal dialog (FR-POP-06).
 * Embeds quick student registration form with desktop center modal and mobile bottom-sheet.
 *
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   courseId?: string,
 *   onSuccess?: () => void,
 * }} props
 */
export default function LeadDialog({
  open,
  onOpenChange,
  courseId = '',
  onSuccess,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="REGISTER INTEREST"
      docRef="FORM DV-01"
    >
      <StudentLeadForm
        variant="popup"
        initialCourseId={courseId}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}

