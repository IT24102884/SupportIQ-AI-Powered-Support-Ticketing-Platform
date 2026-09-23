import api from './client';
import { AuthResponse, User } from '../types';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (
  name: string,
  email: string,
  password: string,
  role: 'customer' | 'agent'
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

