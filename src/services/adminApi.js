import axios from "axios";

const ADMIN_BASE_URL = "http://localhost:8000/api/v1/users/admin";

// Create axios instance with default config
const adminAPI = axios.create({
  baseURL: ADMIN_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

// Authentication APIs
export const adminLogin = (credentials) =>
  axios.post(`${ADMIN_BASE_URL}/login`, credentials, {
    withCredentials: true,
  });

export const getCurrentAdmin = (token) =>
  adminAPI.get("/current-admin", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminLogout = (token) =>
  adminAPI.post(
    "/logout",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// Admin Management APIs
export const adminRegister = (token, adminData) =>
  adminAPI.post("/register", adminData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllAdmins = (token, queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return adminAPI.get(`/list?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAdminById = (token, adminId) =>
  adminAPI.get(`/profile/${adminId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const toggleAdminStatus = (token, adminId, statusData = {}) =>
  adminAPI.patch(`/${adminId}/toggle-status`, statusData, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Dashboard & Analytics APIs
export const getAdminDashboard = (token) =>
  adminAPI.get("/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getSystemAnalytics = (token, period = "7d") =>
  adminAPI.get(`/analytics?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// User Management APIs
export const getAllUsers = (token, queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  return adminAPI.get(`/users/list?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserById = (token, userId) =>
  adminAPI.get(`/users/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const forceDeactivateUser = (token, userId, data) =>
  adminAPI.patch(`/users/${userId}/deactivate`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminReactivateUser = (token, userId) =>
  adminAPI.patch(
    `/users/${userId}/reactivate`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const adminDeleteUser = (token, userId, data) =>
  adminAPI.delete(`/users/${userId}/delete`, {
    headers: { Authorization: `Bearer ${token}` },
    data: data,
  });

// Settings APIs
export const getSettings = (token) =>
  adminAPI.get("/settings", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateSettings = (token, category, settingsData) =>
  adminAPI.patch(
    "/settings/update",
    { category, settings: settingsData },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const updateSpecificSetting = (token, category, key, value) =>
  adminAPI.patch(
    "/settings/update-specific",
    { category, key, value },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const resetSettings = (token, category) =>
  adminAPI.patch(
    "/settings/reset",
    { category },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const regenerateApiKey = (token) =>
  adminAPI.patch(
    "/settings/api-key/regenerate",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const createManualBackup = (token) =>
  adminAPI.post(
    "/settings/backup/create",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const getBackupHistory = (token, page = 1, limit = 10) =>
  adminAPI.get(`/settings/backup/history?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const testEmailNotification = (token, email) =>
  adminAPI.post(
    "/settings/test-email",
    { email },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// Utility functions
export const handleApiError = (error) => {
  let message = "An unexpected error occurred";

  if (error.response) {
    // Server responded with error status
    message =
      error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response received
    message = "Network error - please check your connection";
  } else {
    // Something else happened
    message = error.message || "Request failed";
  }

  console.error("API Error:", error);
  return { message, status: error.response?.status };
};

// Settings validation helpers
export const validateSettings = {
  general: (settings) => {
    const errors = {};

    if (!settings.siteName?.trim()) {
      errors.siteName = "Site name is required";
    } else if (settings.siteName.length > 100) {
      errors.siteName = "Site name must be less than 100 characters";
    }

    if (!settings.siteDescription?.trim()) {
      errors.siteDescription = "Site description is required";
    } else if (settings.siteDescription.length > 500) {
      errors.siteDescription =
        "Site description must be less than 500 characters";
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!settings.adminEmail?.trim()) {
      errors.adminEmail = "Admin email is required";
    } else if (!emailRegex.test(settings.adminEmail)) {
      errors.adminEmail = "Please enter a valid email address";
    }

    return errors;
  },

  security: (settings) => {
    const errors = {};

    if (settings.passwordMinLength < 6 || settings.passwordMinLength > 20) {
      errors.passwordMinLength =
        "Password minimum length must be between 6 and 20";
    }

    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
      errors.sessionTimeout =
        "Session timeout must be between 5 and 480 minutes";
    }

    if (settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 10) {
      errors.maxLoginAttempts = "Max login attempts must be between 3 and 10";
    }

    return errors;
  },

  database: (settings) => {
    const errors = {};

    if (settings.retentionDays < 1 || settings.retentionDays > 365) {
      errors.retentionDays = "Retention days must be between 1 and 365";
    }

    const validFrequencies = ["hourly", "daily", "weekly", "monthly"];
    if (!validFrequencies.includes(settings.backupFrequency)) {
      errors.backupFrequency = "Invalid backup frequency";
    }

    return errors;
  },

  api: (settings) => {
    const errors = {};

    if (
      settings.rateLimitPerMinute < 10 ||
      settings.rateLimitPerMinute > 1000
    ) {
      errors.rateLimitPerMinute =
        "Rate limit must be between 10 and 1000 requests per minute";
    }

    return errors;
  },
};

// Token management utilities
export const tokenUtils = {
  setToken: (token, remember = false) => {
    if (remember) {
      localStorage.setItem("adminToken", token);
      sessionStorage.removeItem("adminToken");
    } else {
      sessionStorage.setItem("adminToken", token);
      localStorage.removeItem("adminToken");
    }
  },

  getToken: () => {
    return (
      localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken")
    );
  },

  removeToken: () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
  },

  isAuthenticated: () => {
    return !!tokenUtils.getToken();
  },
};

// Default settings structure
export const defaultSettings = {
  general: {
    siteName: "My Application",
    siteDescription: "A powerful web application",
    adminEmail: "admin@example.com",
    timezone: "UTC",
    language: "en",
  },
  security: {
    twoFactorAuth: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requirePasswordChange: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    systemAlerts: true,
    userRegistrations: true,
    criticalErrors: true,
  },
  database: {
    autoBackup: false,
    backupFrequency: "daily",
    retentionDays: 30,
    compressionEnabled: true,
  },
  api: {
    apiKey: "sk-1234567890abcdef...",
    rateLimitPerMinute: 100,
    enableCors: true,
    logRequests: true,
  },
};

export default adminAPI;
