import { useState } from 'react';
import { useAuthStore, AuthUser } from '../stores/authStore';

export type { AuthUser };

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const storeLogin = useAuthStore((s) => s.login);
  const storeLogout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await storeLogin(email, password);
      return { success: true as const };
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        'Login failed';
      return { success: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return { user, token, login, logout: storeLogout, loading };
};
