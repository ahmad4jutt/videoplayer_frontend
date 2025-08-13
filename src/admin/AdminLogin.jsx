import React, { useState, useContext } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  X,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the import path as needed

// Blocked Account Modal Component
const BlockedAccountModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/50 shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <UserX className="w-6 h-6 text-red-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">
              Account Deactivated
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-300 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-red-300 text-sm">
              <p className="font-medium mb-2">
                Your account has been deactivated.
              </p>
              <p>Please contact super admin for reactivation.</p>
            </div>
          </div>
        </div>

        <div className="text-slate-300 text-sm mb-6">
          <p className="mb-2">
            If you need access restored, please contact the Super Admin:
          </p>
          <div className="bg-white/10 rounded-lg p-3 border border-white/20">
            <p className="text-white font-mono">vidzio.app@gmail.com</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const navigate = useNavigate();

  // Get loginAdmin and adminLoginInProgress from AuthContext
  const { loginAdmin, adminLoginInProgress } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to check if account is deactivated
  const isAccountDeactivated = (error) => {
    if (!error || !error.response) return false;

    const status = error.response.status;
    const errorData = error.response.data;
    const message = errorData?.message || "";

    console.log("Checking deactivation - Status:", status, "Message:", message);

    // Check for 403 status (Forbidden) which indicates deactivated account
    if (status === 403) {
      // Check if the message contains deactivation keywords
      if (typeof message === "string") {
        const lowerMessage = message.toLowerCase();
        if (
          lowerMessage.includes("deactivated") ||
          lowerMessage.includes("contact super admin") ||
          lowerMessage.includes("reactivation") ||
          lowerMessage.includes("account has been deactivated")
        ) {
          return true;
        }
      }

      // As a fallback, if it's 403 and we can't determine the exact reason,
      // but it's not a credential issue, assume it might be deactivation
      // (you can remove this if it causes false positives)
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Use the actual loginAdmin function from AuthContext
      const response = await loginAdmin({
        email: formData.email,
        password: formData.password,
      });

      console.log("Admin login response:", response);

      // Navigate to admin dashboard on successful login
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login failed:", error);

      // Check if the error is due to deactivated account
      if (isAccountDeactivated(error)) {
        console.log("Account deactivated - showing modal");
        setShowBlockedModal(true);
        return;
      }

      // Handle other error scenarios
      if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setLoginError(
          "Invalid credentials. Please check your email and password."
        );
      } else if (error.response?.status === 403) {
        setLoginError("Access denied. You don't have admin privileges.");
      } else if (error.response?.status === 404) {
        setLoginError("Admin account not found or access denied.");
      } else if (error.message) {
        setLoginError(error.message);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  const handleCloseBlockedModal = () => {
    setShowBlockedModal(false);
    // Clear form data when modal is closed
    setFormData({
      email: "",
      password: "",
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-slate-300">
              Access the administrative dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                        errors.email
                          ? "border-red-400 focus:ring-red-500"
                          : "border-white/30"
                      }`}
                      placeholder="Enter your admin email"
                      disabled={adminLoginInProgress}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all ${
                        errors.password
                          ? "border-red-400 focus:ring-red-500"
                          : "border-white/30"
                      }`}
                      placeholder="Enter your password"
                      disabled={adminLoginInProgress}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                      disabled={adminLoginInProgress}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Login Error */}
                {loginError && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <div className="flex items-center text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {loginError}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={adminLoginInProgress}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  {adminLoginInProgress ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign in to Admin Panel"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              🔒 This is a secure admin area. All activities are logged and
              monitored.
            </p>
          </div>
        </div>
      </div>

      {/* Blocked Account Modal */}
      <BlockedAccountModal
        isOpen={showBlockedModal}
        onClose={handleCloseBlockedModal}
      />
    </>
  );
};

export default AdminLogin;
