import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
//     const token = localStorage.getItem('placify_token');
    const token = sessionStorage.getItem('placify_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await getMe();
      setUser(res.data.data);
    } catch {
//       localStorage.removeItem('placify_token');
     sessionStorage.removeItem('placify_token');
//       localStorage.removeItem('placify_user');
     sessionStorage.removeItem('placify_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = (token, userData) => {
//     localStorage.setItem('placify_token', token);
     sessionStorage.setItem('placify_token', token);
//     localStorage.setItem('placify_user', JSON.stringify(userData));
      sessionStorage.setItem('placify_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
//     localStorage.removeItem('placify_token');
//     localStorage.removeItem('placify_user');
       sessionStorage.removeItem('placify_token');
       sessionStorage.removeItem('placify_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
