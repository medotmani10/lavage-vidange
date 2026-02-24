import { create } from 'zustand';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
  },
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  hasRole: (roles) => {
    const { user } = get();
    return user ? roles.includes(user.role) : false;
  },
}));
