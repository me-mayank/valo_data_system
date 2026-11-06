import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

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

export const leadInputSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters'),

  phone: phoneSchema,

  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Must be a valid email address'),

  college: z
    .string({ required_error: 'College name is required' })
    .trim()
    .min(2, 'College name must be at least 2 characters')
    .max(120, 'College name must not exceed 120 characters'),

  courseYear: z
    .string({ required_error: 'Course and year is required' })
    .trim()
    .min(1, 'Course and year must be provided')
    .max(60, 'Course and year must not exceed 60 characters'),

  interestedCourseIds: z
    .array(
      z
        .string()
        .regex(objectIdRegex, 'Each course ID must be a valid 24-character hexadecimal ID')
    )
    .min(1, 'At least one course must be selected'),

  consent: z.literal(true, {
    errorMap: () => ({ message: 'Consent must be explicitly accepted' }),
  }),

  city: z.string().trim().max(60).optional(),
  preferredMode: z.string().trim().max(40).optional(),
  skillLevel: z.string().trim().max(40).optional(),
  heardFrom: z.string().trim().max(60).optional(),

  source: z
    .string()
    .trim()
    .max(40, 'Source tag cannot exceed 40 characters')
    .regex(/^[a-z0-9-]*$/, 'Source tag must be lowercase alphanumeric with hyphens')
    .optional(),

  pagePath: z.string().trim().max(200).optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  formVariant: z.enum(['popup', 'contact']).default('popup'),

  // Honeypot: accept any string, if non-empty the service silently returns success
  _hp: z.string().optional(),
});
