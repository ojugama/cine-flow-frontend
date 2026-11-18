import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({
  adminOnly = false,
  clientOnly = false,
}) {
  const { isAuthenticated, isAdmin, isClient } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (clientOnly && !isClient) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
