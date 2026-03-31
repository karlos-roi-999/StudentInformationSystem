import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles, userRole }) {
  // No user session — kick to login
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // SuperAdmin bypasses all role checks
  if (userRole === 'SuperAdmin') {
    return children;
  }

  // Role not allowed — send them back to their own dashboard
  if (!allowedRoles.includes(userRole)) {
    const redirect = userRole === 'Admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}

export default ProtectedRoute;
