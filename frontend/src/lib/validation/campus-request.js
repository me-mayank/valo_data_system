import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const campusRequestSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(2, 'Institution name must be at least 2 characters')
    .max(120, 'Institution name must not exceed 120 characters'),

  contactPerson: z
    .string()
    .trim()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(80, 'Contact person name must not exceed 80 characters'),

  designation: z
    .string()
    .trim()
    .min(2, 'Designation must be at least 2 characters')
    .max(80, 'Designation must not exceed 80 characters'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid institutional email address'),

  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^0/, ''))
    .refine((val) => phoneRegex.test(val), {
      message: 'Enter a valid 10-digit mobile number starting with 6-9',
    }),

  approxStudents: z.union([z.number(), z.string()]).optional().nullable(),
  preferredFormat: z.string().trim().optional(),
  message: z.string().trim().max(1000).optional(),

  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to be contacted to proceed' }),
  }),

  source: z.string().trim().max(40).optional(),
  pagePath: z.string().trim().optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  _hp: z.string().optional(),
});

