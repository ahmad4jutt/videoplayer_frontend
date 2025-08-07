import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ShieldIcon, AlertTriangle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
const AdminProtectedRoute = ({ children, fallbackPath = "/admin/login" }) => {
  const { isDarkMode } = useTheme();
  const { adminToken, currentAdmin, adminLoading, isAdminAuthenticated } =
    useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
          <div className="mt-4 flex items-center justify-center">
            <ShieldIcon className="h-5 w-5 text-purple-400 mr-2" />
            <p className="text-white">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if admin is authenticated
  if (!isAdminAuthenticated()) {
    // Redirect to admin login with the current location as state
    // so we can redirect back after successful login
    return (
      <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />
    );
  }

  // Admin is authenticated, render the protected component
  return children;
};

// Alternative component for routes that require super admin privileges
export const SuperAdminProtectedRoute = ({
  children,
  fallbackPath = "/admin/dashboard",
  unauthorizedPath = "/admin/unauthorized",
}) => {
  const {
    adminToken,
    currentAdmin,
    adminLoading,
    isAdminAuthenticated,
    isSuperAdmin,
  } = useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
          <div className="mt-4 flex items-center justify-center">
            <ShieldIcon className="h-5 w-5 text-purple-400 mr-2" />
            <p className="text-white">Verifying super admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if admin is authenticated first
  if (!isAdminAuthenticated()) {
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    );
  }

  // Check if admin has super admin privileges using the helper function
  if (!isSuperAdmin()) {
    // Admin is authenticated but doesn't have super admin privileges
    return <Navigate to={unauthorizedPath} replace />;
  }

  // Super admin is authenticated, render the protected component
  return children;
};

// Component for routes that require any admin role (admin or superadmin)
export const AnyAdminProtectedRoute = ({
  children,
  fallbackPath = "/admin/login",
  unauthorizedPath = "/admin/unauthorized",
}) => {
  const {
    adminToken,
    currentAdmin,
    adminLoading,
    isAdminAuthenticated,
    hasAdminRole,
  } = useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
          <div className="mt-4 flex items-center justify-center">
            <ShieldIcon className="h-5 w-5 text-purple-400 mr-2" />
            <p className="text-white">Verifying admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if admin is authenticated first
  if (!isAdminAuthenticated()) {
    return (
      <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />
    );
  }

  // Check if admin has any admin role using the helper function
  if (!hasAdminRole()) {
    // User is authenticated but doesn't have admin privileges
    return <Navigate to={unauthorizedPath} replace />;
  }

  // Admin is authenticated with proper role, render the protected component
  return children;
};

// Component for unauthorized access page
export const AdminUnauthorized = () => {
  const { currentAdmin, logoutAdmin, isSuperAdmin } = useContext(AuthContext);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoToDashboard = () => {
    window.location.href = "/admin/dashboard";
  };

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = "/admin/login";
  };

  return (
    <div
      className={`min-h-screen  bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4`}
    >
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-300 mb-6">
          You don't have permission to access this resource. Please contact a
          super administrator if you believe this is an error.
        </p>

        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <p className="text-sm text-slate-300 mb-1">
            <span className="font-medium text-white">Current Admin:</span>{" "}
            {currentAdmin?.fullName ||
              currentAdmin?.userName ||
              currentAdmin?.email}
          </p>
          <p className="text-sm text-slate-300">
            <span className="font-medium text-white">Role:</span>{" "}
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isSuperAdmin()
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-blue-500/20 text-blue-300"
              }`}
            >
              {currentAdmin?.role || "Admin"}
            </span>
          </p>
          {currentAdmin?.isAdmin && (
            <p className="text-sm text-slate-300 mt-1">
              <span className="font-medium text-white">Admin Status:</span>{" "}
              <span className="text-green-400">Active</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            Go Back
          </button>
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg border border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 font-medium py-3 px-4 rounded-lg border border-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            Logout
          </button>
        </div>

        {/* Help text */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-400">
            If you need elevated permissions, please contact your system
            administrator or the super admin at{" "}
            <span className="text-purple-400">vidzio.app@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Role-based component renderer
export const AdminRoleGuard = ({
  children,
  allowedRoles = ["admin", "superadmin"],
  fallback = null,
}) => {
  const { currentAdmin, adminLoading, isAdminAuthenticated } =
    useContext(AuthContext);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated()) {
    return fallback;
  }

  const hasRequiredRole = allowedRoles.includes(currentAdmin?.role);

  if (!hasRequiredRole) {
    return fallback;
  }

  return children;
};

export default AdminProtectedRoute;
