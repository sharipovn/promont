import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

/**
 * Axios instance yaratadi va avtomatik refresh logikasini qo‘shadi.
 * @param {function} navigate - `useNavigate` hooki
 * @param {function} setUser - AuthProvider dan userni yangilovchi funksiya
 * @param {function} setAccessToken - AuthProvider dan tokenni yangilovchi funksiya
 */
export const createAxiosInstance = (navigate, setUser, setAccessToken) => {
  const instance = axios.create({
    baseURL: '/api/',
    headers: { 'Content-Type': 'application/json' },
  });

  // Tokenni requestga qo‘shish
  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get('access');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 401 bo‘lsa refresh qilib qaytadan urinadi yoki logout qiladi
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refresh = Cookies.get('refresh');
          const res = await axios.post('/api/refresh/', { refresh });
          const newAccess = res.data.access;
          const decoded = jwtDecode(newAccess);

          // Cookies.set('access', newAccess, { path: '/', secure: true, sameSite: 'Strict' });
          Cookies.set('access', newAccess, { path: '/' });
          setAccessToken(newAccess);
          setUser({
            username: decoded.username,
            fio: decoded.fio,
            position: decoded.position,
            role: decoded.role,
            capabilities: decoded.capabilities || [],
          });

          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
          return instance(originalRequest);
        } catch (err) {
          Cookies.remove('access');
          Cookies.remove('refresh');
          setAccessToken(null);
          setUser(null);
          navigate('/');
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
