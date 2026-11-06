import { z } from 'zod';

export const updateSettingsSchema = z.object({
  popupEnabled: z.boolean().optional(),
  popupDelaySeconds: z.number().int().min(0).max(120).optional(),
  popupScrollPercent: z.number().int().min(0).max(100).optional(),
  popupReappearSeconds: z.number().int().min(0).max(3600).optional(),
  popupMaxDismissals: z.number().int().min(1).max(50).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  instagramUrl: z.string().url().optional().or(z.literal('')).nullable(),
  linkedinUrl: z.string().url().optional().or(z.literal('')).nullable(),
});
