import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem('ab_user')); } catch { return null; } });
  const [token, setToken] = useState(() => sessionStorage.getItem('ab_token'));

  const login = useCallback((u, t) => {
    setUser(u); setToken(t);
    sessionStorage.setItem('ab_user', JSON.stringify(u));
    sessionStorage.setItem('ab_token', t);
  }, []);

  const logout = useCallback(() => {
    setUser(null); setToken(null);
    sessionStorage.removeItem('ab_user');
    sessionStorage.removeItem('ab_token');
  }, []);

  return <Ctx.Provider value={{ user, token, login, logout, isAuth: !!token }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
