import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  // 1. Not logged in? Kick to login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // 2. Are roles required, and does the user have ANY of them?
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = user.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasRequiredRole) {
      // Logged in, but lacking permissions (e.g., Passenger trying to access Driver page)
      return <Navigate to="/unauthorized" replace />;
    }
  }
  // 3. User is authorized. Render the child routes.
  return <Outlet />;
};
export default ProtectedRoute;
