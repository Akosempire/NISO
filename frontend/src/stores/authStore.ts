import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: string;
  station: { id: string; name: string } | null;
  regionId?: string | null;
}

interface AuthStore {
  user:            AuthUser | null;
  token:           string | null;
  login:           (email: string, password: string) => Promise<void>;
  logout:          () => void;
  setToken:        (token: string) => void;
  setUser:         (user: AuthUser) => void;
  isAuthenticated: () => boolean;
}

function hydrateUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

function hydrateToken(): string | null {
  const raw = localStorage.getItem('authToken');
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  return raw;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:  hydrateUser(),
  token: hydrateToken(),

  login: async (email: string, password: string) => {
    // Import here to avoid circular reference (apiClient → authStore → apiClient)
    const { apiClient } = await import('../services/api');
    const data = await apiClient.post('/auth/login', { email, password }) as any;
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user',      JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
    set({ token });
  },

  setUser: (user: AuthUser) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  isAuthenticated: () => {
    return get().token !== null && get().user !== null;
  },
}));
