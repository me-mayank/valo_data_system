import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const studentLeadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters'),

  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^0/, ''))
    .refine((val) => phoneRegex.test(val), {
      message: 'Enter a valid 10-digit Indian mobile number starting with 6-9',
    }),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address'),

  college: z
    .string()
    .trim()
    .min(2, 'College name must be at least 2 characters')
    .max(120, 'College name must not exceed 120 characters'),

  courseYear: z
    .string()
    .trim()
    .min(1, 'Course and academic year is required')
    .max(60, 'Course and year must not exceed 60 characters'),

  interestedCourseIds: z
    .array(z.string())
    .min(1, 'Select at least one course of interest'),

  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to be contacted to proceed' }),
  }),

  city: z.string().trim().max(60).optional(),
  preferredMode: z.string().trim().optional(),
  skillLevel: z.string().trim().optional(),
  heardFrom: z.string().trim().optional(),

  source: z.string().trim().max(40).optional(),
  pagePath: z.string().trim().optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  formVariant: z.enum(['popup', 'contact']).default('popup'),
  _hp: z.string().optional(),
});

