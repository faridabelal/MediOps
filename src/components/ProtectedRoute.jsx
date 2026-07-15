import {
  Navigate,
  Outlet
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  allowedRoles
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    const destination =
      user.role === "coordinator"
        ? "/dashboard"
        : "/employee/dashboard";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}