import { z } from 'zod';

const levelEnum = z.preprocess(
  (v) => (typeof v === 'string' ? v.toLowerCase().trim() : v),
  z.enum(['beginner', 'intermediate', 'advanced'])
);

const modeEnum = z.preprocess(
  (v) => (typeof v === 'string' ? v.toLowerCase().trim() : v),
  z.enum(['online', 'offline', 'hybrid'])
);

export const createCourseSchema = z.object({
  title: z.string().min(2).max(120).trim(),
  slug: z.string().min(2).max(120).trim().optional(),
  shortDescription: z.string().min(5).max(160).trim(),
  code: z.string().max(12).trim().toUpperCase().optional().nullable(),
  overview: z.string().optional().nullable(),
  syllabus: z
    .array(
      z.object({
        title: z.string().min(1).trim(),
        topics: z.array(z.string().trim()).default([]),
      })
    )
    .default([]),
  category: z.string().trim().optional().nullable(),
  tools: z.array(z.string().trim()).default([]),
  level: levelEnum.default('beginner'),
  mode: modeEnum.default('online'),
  duration: z.string().trim().optional().nullable(),
  audience: z.string().optional().nullable(),
  fee: z.number().nonnegative().optional().nullable(),
  thumbnail: z
    .object({
      url: z.string().trim().optional(),
      publicId: z.string().trim().optional(),
    })
    .optional()
    .nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateCourseSchema = createCourseSchema.partial();

export const updateCourseStatusSchema = z.object({
  status: z.enum(['draft', 'published']),
});

export const reorderCoursesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int(),
      })
    )
    .min(1, 'At least one item is required for reordering'),
});
