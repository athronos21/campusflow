import { z } from 'zod';

export const DietaryPreferenceSchema = z.enum([
  'non_fasting',
  'fasting',
  'vegetarian',
  'halal',
]);
export type DietaryPreference = z.infer<typeof DietaryPreferenceSchema>;

export const MealPeriodSchema = z.enum(['breakfast', 'lunch', 'dinner']);
export type MealPeriod = z.infer<typeof MealPeriodSchema>;

export const MealPlanDtoSchema = z.object({
  id: z.string().uuid(),
  campusId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  priceMinor: z.union([z.string(), z.number(), z.bigint()]).nullable(),
  billingDurationDays: z.number().int().nullable(),
  isActive: z.boolean(),
});
export type MealPlanDto = z.infer<typeof MealPlanDtoSchema>;

export const MealPassDtoSchema = z.object({
  id: z.string().uuid(),
  studentProfileId: z.string().uuid(),
  mealPlanId: z.string().uuid(),
  dietaryPreference: DietaryPreferenceSchema,
  passCode: z.string(),
  validFrom: z.string(),
  validUntil: z.string(),
  isActive: z.boolean(),
});
export type MealPassDto = z.infer<typeof MealPassDtoSchema>;

export const VerifyMealPassSchema = z.object({
  passCode: z.string(),
  mealPeriod: MealPeriodSchema,
  diningHall: z.string().min(2),
});
export type VerifyMealPassDto = z.infer<typeof VerifyMealPassSchema>;

export const RecordMealScanSchema = z.object({
  mealPassId: z.string().uuid(),
  mealPeriod: MealPeriodSchema,
  diningHall: z.string().min(2),
  scannedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD date format').optional(),
});
export type RecordMealScanDto = z.infer<typeof RecordMealScanSchema>;

export const MealScanLogDtoSchema = z.object({
  id: z.string().uuid(),
  mealPassId: z.string().uuid(),
  scannedById: z.string().uuid(),
  mealPeriod: MealPeriodSchema,
  scannedDate: z.string(),
  scannedAt: z.string(),
  diningHall: z.string(),
});
export type MealScanLogDto = z.infer<typeof MealScanLogDtoSchema>;
