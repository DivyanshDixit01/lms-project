// client/src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  requiredRole = null,
}) => {
  const location = useLocation();

  // Use 'auth' to match the reducer name in your store
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth,
  );

  // Debug: Log the auth state
  console.log("Auth State in ProtectedRoute:", {
    isAuthenticated,
    user,
    isLoading,
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role if required (instructor or student)
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`Role mismatch: required ${requiredRole}, got ${user?.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children or outlet
  return children ? children : <Outlet />;
};
