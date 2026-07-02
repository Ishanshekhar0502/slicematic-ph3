import { isSupabaseConfigured } from './supabase';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
}

export function getMockUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('slicematic_mock_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

export function setMockUser(user: MockUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('slicematic_mock_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('slicematic_mock_user');
  }
  // Dispatch a custom event to notify components
  window.dispatchEvent(new Event('mock-auth-change'));
}
