import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    if (allowedRole === "admin") {
      return <Navigate to="/admin/login" replace />;
    }

    if (allowedRole === "rescue_team") {
      return <Navigate to="/team-login" replace />;
    }

    return <Navigate to="/citizen-login" replace />;
  }

  // Wrong role
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === "rescue_team") {
      return <Navigate to="/team-dashboard" replace />;
    }

    return <Navigate to="/citizen-dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;