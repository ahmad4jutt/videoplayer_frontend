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
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
        }`}
      >
        <div
          className={`text-center backdrop-blur-lg rounded-2xl p-8 border shadow-2xl ${
            isDarkMode
              ? "bg-white/10 border-white/20"
              : "bg-gray-900/10 border-gray-300/20"
          }`}
        >
          <div
            className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto ${
              isDarkMode ? "border-gray-400" : "border-gray-600"
            }`}
          ></div>
          <div className="mt-4 flex items-center justify-center">
            <ShieldIcon
              className={`h-5 w-5 mr-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <p className={isDarkMode ? "text-white" : "text-gray-700"}>
              Verifying admin access...
            </p>
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
  const { isDarkMode } = useTheme();
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
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
        }`}
      >
        <div
          className={`text-center backdrop-blur-lg rounded-2xl p-8 border shadow-2xl ${
            isDarkMode
              ? "bg-white/10 border-white/20"
              : "bg-gray-900/10 border-gray-300/20"
          }`}
        >
          <div
            className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto ${
              isDarkMode ? "border-gray-400" : "border-gray-600"
            }`}
          ></div>
          <div className="mt-4 flex items-center justify-center">
            <ShieldIcon
              className={`h-5 w-5 mr-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <p className={isDarkMode ? "text-white" : "text-gray-700"}>
              Verifying super admin access...
            </p>
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
  const { isDarkMode } = useTheme();
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
      <div
        className={`flex items-center justify-center min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
        }`}
      >
        <div
          className={`text-center backdrop-blur-lg rounded-2xl p-8 border shadow-2xl ${
            isDarkMode
              ? "bg-white/10 border-white/20"
              : "bg-gray-900/10 border-gray-300/20"
          }`}
        >
          <div
            className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto ${
              isDarkMode ? "border-gray-400" : "border-gray-600"
            }`}
          ></div>
          <div className="mt-4 flex items-center justify-center">
            <ShieldIcon
              className={`h-5 w-5 mr-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
            <p className={isDarkMode ? "text-white" : "text-gray-700"}>
              Verifying admin access...
            </p>
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
  const { isDarkMode } = useTheme();
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
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
      }`}
    >
      <div
        className={`max-w-md w-full backdrop-blur-sm rounded-2xl p-8 border shadow-sm text-center ${
          isDarkMode
            ? "bg-white/10 border-white/20"
            : "bg-gray-900/10 border-gray-300/20"
        }`}
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h1
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Access Denied
        </h1>
        <p
          className={`mb-6 ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}
        >
          You don't have permission to access this resource. Please contact a
          super administrator if you believe this is an error.
        </p>
        <div
          className={`rounded-lg p-4 mb-6 border ${
            isDarkMode
              ? "bg-white/5 border-white/10"
              : "bg-gray-900/5 border-gray-300/10"
          }`}
        >
          <p
            className={`text-sm mb-1 ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            <span
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Current Admin:
            </span>{" "}
            {currentAdmin?.fullName ||
              currentAdmin?.userName ||
              currentAdmin?.email}
          </p>
          <p
            className={`text-sm ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            <span
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Role:
            </span>{" "}
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isSuperAdmin()
                  ? "bg-gray-200/20 text-gray-600"
                  : "bg-gray-200/20 text-gray-900"
              }`}
            >
              {currentAdmin?.role || "Admin"}
            </span>
          </p>
          {currentAdmin?.isAdmin && (
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}
            >
              <span
                className={`font-medium ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Admin Status:
              </span>{" "}
              <span className="text-green-400">Active</span>
            </p>
          )}
        </div>
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500"
                : "bg-gray-700 hover:bg-gray-800 text-white focus:ring-gray-600"
            }`}
          >
            Go Back
          </button>
          <button
            onClick={handleGoToDashboard}
            className={`w-full font-medium py-3 px-4 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "bg-white/10 hover:bg-white/20 text-white border-white/20 focus:ring-white/50"
                : "bg-gray-900/10 hover:bg-gray-900/20 text-gray-700 border-gray-300/20 focus:ring-gray-500/50"
            }`}
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg border border-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            Logout
          </button>
        </div>
        {/* Help text */}
        <div
          className={`mt-6 pt-6 border-t ${
            isDarkMode ? "border-white/10" : "border-gray-300/10"
          }`}
        >
          <p
            className={`text-xs ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            If you need elevated permissions, please contact your system
            administrator or the super admin at{" "}
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              vidzio.app@gmail.com
            </span>
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
  const { isDarkMode } = useTheme();
  const { currentAdmin, adminLoading, isAdminAuthenticated } =
    useContext(AuthContext);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div
          className={`animate-spin rounded-full h-6 w-6 border-b-2 ${
            isDarkMode ? "border-gray-400" : "border-gray-600"
          }`}
        ></div>
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
