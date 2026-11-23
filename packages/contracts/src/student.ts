import { z } from 'zod';

export const AcademicLevelSchema = z.enum([
  'undergraduate',
  'postgraduate',
  'doctoral',
  'tvet',
]);
export type AcademicLevel = z.infer<typeof AcademicLevelSchema>;

export const StudentIdStatusSchema = z.enum([
  'active',
  'suspended',
  'graduated',
  'lost',
]);
export type StudentIdStatus = z.infer<typeof StudentIdStatusSchema>;

export const CreateStudentProfileSchema = z.object({
  studentIdNumber: z.string().min(3).max(50),
  college: z.string().min(2).max(150),
  department: z.string().min(2).max(150),
  academicLevel: AcademicLevelSchema.default('undergraduate'),
  batchYear: z.number().int().min(2000).max(2100),
  emergencyPhone: z.string().optional(),
  expiresAt: z.string().datetime(),
});
export type CreateStudentProfileDto = z.infer<typeof CreateStudentProfileSchema>;

export const StudentProfileDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  campusId: z.string().uuid(),
  studentIdNumber: z.string(),
  college: z.string(),
  department: z.string(),
  academicLevel: AcademicLevelSchema,
  batchYear: z.number().int(),
  emergencyPhone: z.string().nullable(),
  idCardStatus: StudentIdStatusSchema,
  qrSecret: z.string(),
  issuedAt: z.string(),
  expiresAt: z.string(),
});
export type StudentProfileDto = z.infer<typeof StudentProfileDtoSchema>;

export const VerifyStudentIdSchema = z.object({
  studentIdNumber: z.string(),
  qrToken: z.string().optional(),
});
export type VerifyStudentIdDto = z.infer<typeof VerifyStudentIdSchema>;
