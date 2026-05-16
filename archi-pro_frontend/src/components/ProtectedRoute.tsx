import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';

type ProtectedRouteProps = {
  children: React.ReactElement;
  requiredPermissions?: string[];
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, requiredPermissions = [], allowedRoles = [] }: ProtectedRouteProps) {
  const location = useLocation();
  const auth = useContext(AuthContext);
      if (!auth) {
          throw new Error('AuthContext is not available');
      }
  const user = auth.user;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role === 'ADMIN') {
    return children;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role ?? '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions.length > 0) {
    const permissionCodes = new Set<string>(user.permissions ?? []);
    const hasPermission = requiredPermissions.some(permission => permissionCodes.has(permission));

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}