import { z } from 'zod';

export const CreateLearningResourceSchema = z.object({
  campusId: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().optional(),
  department: z.string().min(2),
  courseCode: z.string().min(2),
  resourceType: z.enum(['lecture_note', 'past_exam', 'syllabus', 'lab_manual']).default('lecture_note'),
  fileUrl: z.string().min(1),
});

export type CreateLearningResourceDto = z.infer<typeof CreateLearningResourceSchema>;

export interface LearningResourceDto {
  id: string;
  campusId: string;
  uploaderId: string;
  title: string;
  description?: string | null;
  department: string;
  courseCode: string;
  resourceType: string;
  fileUrl: string;
  downloadCount: number;
  isApproved: boolean;
  createdAt: string;
  uploader?: {
    displayName: string;
  };
}
