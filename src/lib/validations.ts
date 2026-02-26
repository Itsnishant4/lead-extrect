import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(100),
});

export const searchLeadsSchema = z.object({
  query: z.string().min(1).max(500),
  taskId: z.number().optional(),
  forceStore: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  name: z.string().min(1).max(100),
  keywords: z.array(z.string().min(1)).min(1).max(1000),
});
