import { createContext, useEffect, useState, useRef } from "react";
import UseLocalStorage from "../hooks/UseLocalStorage";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { getcurrentUser, loginUser } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = UseLocalStorage("authToken", null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginInprogress, setLoginInProgress] = useState(false);
  const navigate = useNavigate();

  // Use ref to prevent multiple simultaneous API calls
  const fetchingUserRef = useRef(false);

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

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setLoading(false);
    fetchingUserRef.current = false; // Reset ref on logout
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        login,
        logout,
        setCurrentUser,
        loading,
        loginInprogress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
