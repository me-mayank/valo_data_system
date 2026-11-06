import { z } from 'zod';

const phoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .trim()
  .transform((val) => val.replace(/[\s-]/g, ''))
  .refine(
    (val) => {
      const cleaned = val.replace(/^\+91/, '').replace(/^0/, '');
      return /^[6-9]\d{9}$/.test(cleaned);
    },
    { message: 'Must be a valid 10-digit Indian mobile number starting with 6-9' }
  )
  .transform((val) => val.replace(/^\+91/, '').replace(/^0/, ''));

export const campusRequestInputSchema = z.object({
  institution: z
    .string({ required_error: 'Institution name is required' })
    .trim()
    .min(2, 'Institution name must be at least 2 characters')
    .max(120, 'Institution name must not exceed 120 characters'),

  contactPerson: z
    .string({ required_error: 'Contact person name is required' })
    .trim()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(80, 'Contact person name must not exceed 80 characters'),

  designation: z
    .string({ required_error: 'Designation is required' })
    .trim()
    .min(2, 'Designation must be at least 2 characters')
    .max(80, 'Designation must not exceed 80 characters'),

  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Must be a valid email address'),

  phone: phoneSchema,

  approxStudents: z.union([z.number(), z.string()]).optional().nullable(),
  preferredFormat: z.string().trim().max(40).optional(),
  message: z.string().trim().max(1000).optional(),

  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent must be explicitly accepted' }),
  }),

  source: z
    .string()
    .trim()
    .max(40, 'Source tag cannot exceed 40 characters')
    .regex(/^[a-z0-9-]*$/, 'Source tag must be lowercase alphanumeric with hyphens')
    .optional(),

  pagePath: z.string().trim().max(200).optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),

  // Honeypot: accept any string, if non-empty the service silently returns success
  _hp: z.string().optional(),
});
