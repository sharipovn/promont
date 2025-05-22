import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAccessToken(token);
        setUser({
          username: decoded.username,
          fio: decoded.fio,
          position: decoded.position,
          role: decoded.role,
          capabilities: decoded.capabilities || [],
        });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Login failed');

    const { access, refresh } = await res.json();
    const decoded = jwtDecode(access);
    setAccessToken(access);
    setUser({
      username: decoded.username,
      fio: decoded.fio,
      position: decoded.position,
      role: decoded.role,
      capabilities: decoded.capabilities || [],
    });

    // Cookies.set('access', access, { path: '/', secure: true, sameSite: 'Strict' });
    // Cookies.set('refresh', refresh, { path: '/', secure: true, sameSite: 'Strict' });

    Cookies.set('access', access, { path: '/' });
    Cookies.set('refresh', refresh, { path: '/'});
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    Cookies.remove('access');
    Cookies.remove('refresh');
  };

  const hasCapability = (cap) => user?.capabilities?.includes(cap);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        hasCapability,
        loading,
        setAccessToken, // 🔑 kerak bo'ladi axiosInstance uchun
        setUser          // 🔑 kerak bo'ladi axiosInstance uchun
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
