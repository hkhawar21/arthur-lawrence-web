import { z } from 'zod';

import { apiSuccessResponseSchema } from '@/types/api';

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
});

export const loginDataSchema = z.object({
  token: z.string(),
  user: authUserSchema,
});

export const loginResponseSchema = apiSuccessResponseSchema(loginDataSchema);

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginResponse = z.infer<typeof loginDataSchema>;

export type LoginRequest = {
  email: string;
  password: string;
};
