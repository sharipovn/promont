import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🆕 loading holati

  useEffect(() => {
    const token = Cookies.get('access');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAccessToken(token);
        setUser({
          username: decoded.username,
          fio: decoded.fio,
          position : decoded.position,
          role: decoded.role,
          capabilities: decoded.capabilities || [],
        });
      } catch {
        Cookies.remove('access');
        Cookies.remove('refresh');
      }
    }
    setLoading(false); // 🆕 user tekshiruvi tugadi
  }, []);

  const login = async (username, password) => {
    const res = await axios.post(
      'http://localhost:8000/api/login/',
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const { access, refresh } = res.data;
    const decoded = jwtDecode(access);
    setAccessToken(access);
    setUser({
      username: decoded.username,
      fio: decoded.fio,
      role: decoded.role,
      position : decoded.position,
      capabilities: decoded.capabilities || [],
    });
    Cookies.set('access', access, { path: '/', secure: true, sameSite: 'Strict' });
    Cookies.set('refresh', refresh, { path: '/', secure: true, sameSite: 'Strict' });
  };

  const refreshAccessToken = async () => {
    try {
      const refresh = Cookies.get('refresh');
      const res = await axios.post('http://localhost:8000/api/refresh/', { refresh });
      const { access } = res.data;
      const decoded = jwtDecode(access);
      setAccessToken(access);
      setUser({
        username: decoded.username,
        fio: decoded.fio,
        position : decoded.position,
        role: decoded.role,
        capabilities: decoded.capabilities || [],
      });
      Cookies.set('access', access, { path: '/', secure: true, sameSite: 'Strict' });
      return access;
    } catch {
      logout();
      throw new Error('Session expired');
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    Cookies.remove('access');
    Cookies.remove('refresh');
  };

  const hasCapability = (cap) => user?.capabilities?.includes(cap);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      login,
      logout,
      refreshAccessToken,
      hasCapability,
      loading // 🆕 contextga qo‘shildi
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuth = () => useContext(AuthContext);
