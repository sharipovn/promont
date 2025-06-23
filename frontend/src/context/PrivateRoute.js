import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, requiredCapabilities = [] }) {
  const { user, hasCapability, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/" />;

  // ❗ Check if user has AT LEAST ONE required capability
  const hasAccess =
    requiredCapabilities.length === 0 ||
    requiredCapabilities.some(cap => hasCapability(cap));

  if (!hasAccess) {
    return <Navigate to="/noaccess" />;
  }

  return children;
}
