import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  fetchCurrentUser,
} from '../api/endpoints';
import { authBus, ensureCsrf } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureCsrf();
        const me = await fetchCurrentUser();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = () => setUser(null);
    authBus.addEventListener('auth:logout', handler);
    return () => authBus.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (username, password) => {
    const me = await apiLogin(username, password);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (username, email, password) => {
    await apiRegister(username, email, password);
    return apiLogin(username, password).then((me) => {
      setUser(me);
      return me;
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      bootstrapping,
      login,
      logout,
      register,
      setUser,
    }),
    [user, bootstrapping, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
