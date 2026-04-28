import { User } from '../types';

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};