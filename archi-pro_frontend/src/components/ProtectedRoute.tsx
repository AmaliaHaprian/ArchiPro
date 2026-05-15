import { Navigate, useLocation } from 'react-router-dom';

type StoredUser = {
  role?: string;
  permissions?: string[];
};

type ProtectedRouteProps = {
  children: React.ReactElement;
  requiredPermissions?: string[];
  allowedRoles?: string[];
};

function readStoredUser(): StoredUser | null {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as StoredUser;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, requiredPermissions = [], allowedRoles = [] }: ProtectedRouteProps) {
  const location = useLocation();
  const user = readStoredUser();

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
    const userPermissions = new Set(user.permissions ?? []);
    const hasPermission = requiredPermissions.some(permission => userPermissions.has(permission));

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}