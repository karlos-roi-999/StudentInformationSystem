import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles, userRole }) {
  // Not logged in — redirect to login
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // SuperAdmin can access everything
  if (userRole === 'SuperAdmin') {
    return children;
  }

  // Check if current role is allowed
  if (!allowedRoles.includes(userRole)) {
    // Redirect to the user's own dashboard
    const redirect = userRole === 'Admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}

export default ProtectedRoute;
