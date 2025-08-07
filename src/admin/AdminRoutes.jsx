import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminLogin from "./adminLogin";
import AdminUsers from "./AdminUsers";
import AdminAnalytics from "./AdminAnalytics";
import AdminDashboard from "./AdminDashboard";
import AdminSettings from "./AdminSettings";
import MenageAdmins from "./MenageAdmins";
import AdminProtectedRoute, {
  AdminUnauthorized,
  SuperAdminProtectedRoute,
} from "./AdminProtectedRoutes";
import { ThemeProvider } from "../context/ThemeContext";

const AdminRoutes = () => {
  return (
    <ThemeProvider>
      <Routes>
        {/* Admin login route - not protected */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route
          path="/"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route
            path="settings"
            element={
              <SuperAdminProtectedRoute>
                <AdminSettings />
              </SuperAdminProtectedRoute>
            }
          />

          {/* Super admin only routes */}
          <Route
            path="admins"
            element={
              <SuperAdminProtectedRoute>
                <MenageAdmins />
              </SuperAdminProtectedRoute>
            }
          />

          {/* Unauthorized access page */}
          <Route path="unauthorized" element={<AdminUnauthorized />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default AdminRoutes;
