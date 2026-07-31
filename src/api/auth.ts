import { apiRequest } from '@/api/client';
import { loginResponseSchema, type LoginRequest, type LoginResponse } from '@/types/auth';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const json = await apiRequest<unknown>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
  return loginResponseSchema.parse(json).data;
}
