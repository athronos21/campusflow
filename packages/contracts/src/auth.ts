import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+251\d{9}$/, 'Must be an Ethiopian phone number (e.g. +251911223344)').optional(),
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(60),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  campusId: z.string().uuid('Valid campus ID required'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone number must be provided',
  path: ['email'],
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Email or phone required'),
  password: z.string().min(1, 'Password required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    status: z.string(),
    memberships: z.array(z.object({
      campusId: z.string().uuid(),
      role: z.string(),
    })),
  }),
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;
