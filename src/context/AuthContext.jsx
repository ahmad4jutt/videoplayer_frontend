import { createContext, useEffect, useState, useRef } from "react";
import { useLocalStorage } from "../hooks/UseLocalStorage";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  getcurrentUser,
  loginUser,
  resetPassword,
  adminLogin,
  adminRegister,
  getCurrentAdmin, // Add this import
} from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // User authentication state
  const [token, setToken] = useLocalStorage("authToken", null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginInprogress, setLoginInProgress] = useState(false);
  const [resetPasswordInProgress, setResetPasswordInProgress] = useState(false);

  // Admin authentication state
  const [adminToken, setAdminToken] = useLocalStorage("adminAuthToken", null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminLoginInProgress, setAdminLoginInProgress] = useState(false);
  const [adminRegisterInProgress, setAdminRegisterInProgress] = useState(false);

  const navigate = useNavigate();

  // Use ref to prevent multiple simultaneous API calls
  const fetchingUserRef = useRef(false);
  const fetchingAdminRef = useRef(false);

  // User authentication effect
  useEffect(() => {
    const initialAuth = async () => {
      // Prevent multiple simultaneous calls
      if (fetchingUserRef.current) {
        return;
      }

      if (token) {
        // Check if token is expired before making API call
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            setToken(null);
            setCurrentUser(null);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Invalid token format:", error);
          setToken(null);
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        fetchingUserRef.current = true;
        try {
          const res = await getcurrentUser(token);
          setCurrentUser(res.data.data);
        } catch (error) {
          console.error("Failed to fetch current user:", error.response?.data);
          console.error("Error status:", error.response?.status);

          // If token is invalid (401/403), clear it
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            setToken(null);
            setCurrentUser(null);
          }
        } finally {
          fetchingUserRef.current = false;
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    };

    initialAuth();
  }, [token]);

  // Admin authentication effect - UPDATED to use getCurrentAdmin API
  useEffect(() => {
    const initialAdminAuth = async () => {
      // Prevent multiple simultaneous calls
      if (fetchingAdminRef.current) {
        return;
      }

      if (adminToken) {
        // Check if admin token is expired before making API call
        try {
          const decoded = jwtDecode(adminToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            setAdminToken(null);
            setCurrentAdmin(null);
            setAdminLoading(false);
            return;
          }
        } catch (error) {
          console.error("Invalid admin token format:", error);
          setAdminToken(null);
          setCurrentAdmin(null);
          setAdminLoading(false);
          return;
        }

        fetchingAdminRef.current = true;
        try {
          // Use the actual getCurrentAdmin API instead of decoding JWT
          const res = await getCurrentAdmin(adminToken);
          setCurrentAdmin(res.data.data.admin);
        } catch (error) {
          console.error("Failed to fetch current admin:", error.response?.data);
          console.error("Error status:", error.response?.status);

          // If token is invalid (401/403), clear it
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            setAdminToken(null);
            setCurrentAdmin(null);
          }
        } finally {
          fetchingAdminRef.current = false;
          setAdminLoading(false);
        }
      } else {
        setCurrentAdmin(null);
        setAdminLoading(false);
      }
    };

    initialAdminAuth();
  }, [adminToken]);

  // User login function
  const login = async (credentials) => {
    if (loginInprogress) {
      console.log("Login already in progress, skipping...");
      return;
    }

    try {
      setLoginInProgress(true);
      setLoading(true);
      console.log("AuthContext: starting login...");

      const response = await loginUser(credentials);
      const receivedToken = response.data.data.accessToken;

      if (!receivedToken) {
        throw new Error("No token received from server");
      }

      // Store token first
      setToken(receivedToken);

      // Don't set currentUser here - let useEffect handle it
      // This prevents the race condition

      return response;
    } catch (error) {
      console.log("Login error in authProvider:", error);
      setLoading(false); // Make sure to reset loading on error
      throw error;
    } finally {
      setLoginInProgress(false);
    }
  };

  // Admin login function
  const loginAdmin = async (credentials) => {
    if (adminLoginInProgress) {
      console.log("Admin login already in progress, skipping...");
      return;
    }

    try {
      setAdminLoginInProgress(true);
      setAdminLoading(true);
      console.log("AuthContext: starting admin login...");

      const response = await adminLogin(credentials);

      // Check if the response indicates successful login
      if (response && response.data && response.data.success) {
        const receivedToken = response.data.data.accessToken;

        if (!receivedToken) {
          throw new Error("No admin token received from server");
        }

        // Store admin token
        setAdminToken(receivedToken);
        console.log("Admin login successful");

        return response;
      } else {
        // Handle case where response doesn't indicate success
        throw new Error("Login failed - invalid response format");
      }
    } catch (error) {
      console.log("Admin login error in authProvider:", error);
      setAdminLoading(false);

      // If it's a deactivation error (403), let the component handle it
      if (error.response?.status === 403) {
        const message = error.response.data?.message || "";
        if (message.toLowerCase().includes("deactivated")) {
          // Don't modify the error, let the component handle the modal
          throw error;
        }
      }

      // For other errors, throw as usual
      throw error;
    } finally {
      setAdminLoginInProgress(false);
    }
  };

  // Admin register function
  const registerAdmin = async (adminData, authToken = null) => {
    if (adminRegisterInProgress) {
      console.log("Admin registration already in progress, skipping...");
      return;
    }

    try {
      setAdminRegisterInProgress(true);
      console.log("AuthContext: starting admin registration...");

      // Use provided token or current admin token
      const tokenToUse = authToken || adminToken;

      if (!tokenToUse) {
        throw new Error("Authorization token required for admin registration");
      }

      const response = await adminRegister(tokenToUse, adminData);

      console.log("Admin registration successful");
      return response;
    } catch (error) {
      console.log("Admin registration error in authProvider:", error);
      throw error;
    } finally {
      setAdminRegisterInProgress(false);
    }
  };

  // User password reset function
  const handleResetPassword = async (resetToken, newPassword) => {
    if (resetPasswordInProgress) {
      console.log("Reset password already in progress, skipping...");
      return;
    }

    try {
      setResetPasswordInProgress(true);
      console.log("AuthContext: starting password reset...");

      const response = await resetPassword(resetToken, newPassword);

      console.log("Password reset successful");
      return response;
    } catch (error) {
      console.log("Reset password error in authProvider:", error);
      throw error;
    } finally {
      setResetPasswordInProgress(false);
    }
  };

  // User logout function
  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setLoading(false);
    fetchingUserRef.current = false; // Reset ref on logout
  };

  // Admin logout function
  const logoutAdmin = () => {
    setAdminToken(null);
    setCurrentAdmin(null);
    setAdminLoading(false);
    fetchingAdminRef.current = false; // Reset ref on logout
  };

  // Helper functions to check user/admin status
  const isAuthenticated = () => {
    return !!token && !!currentUser;
  };

  const isAdminAuthenticated = () => {
    return !!adminToken && !!currentAdmin;
  };

  const isUserAdmin = () => {
    return currentUser?.isAdmin === true || currentUser?.role === "admin";
  };

  // Helper function to check if current admin is super admin
  const isSuperAdmin = () => {
    return currentAdmin?.role === "superadmin";
  };

  // Helper function to check if current admin has admin privileges
  const hasAdminRole = () => {
    return (
      currentAdmin?.role === "admin" || currentAdmin?.role === "superadmin"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        // User authentication
        token,
        currentUser,
        login,
        logout,
        setCurrentUser,
        loading,
        loginInprogress,
        resetPassword: handleResetPassword,
        resetPasswordInProgress,
        isAuthenticated,
        isUserAdmin,

        // Admin authentication
        adminToken,
        currentAdmin,
        loginAdmin,
        logoutAdmin,
        registerAdmin,
        setCurrentAdmin,
        adminLoading,
        adminLoginInProgress,
        adminRegisterInProgress,
        isAdminAuthenticated,
        isSuperAdmin,
        hasAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
