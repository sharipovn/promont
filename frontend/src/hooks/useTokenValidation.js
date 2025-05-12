import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthProvider';

export default function useTokenValidation() {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validate = async () => {
      if (!accessToken) return;

      try {
        const decoded = jwtDecode(accessToken);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          try {
            await refreshAccessToken();
          } catch {
            logout();
            navigate('/');
          }
        }
      } catch {
        logout();
        navigate('/');
      }
    };

    validate();
  }, [accessToken, refreshAccessToken, logout, navigate]);
}
