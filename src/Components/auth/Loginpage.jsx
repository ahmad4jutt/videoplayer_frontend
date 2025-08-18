import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { forgotPassword } from "../../services/api";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  X,
  AlertTriangle,
  Clock,
  Wrench,
  Shield,
  Info,
} from "lucide-react";

import AccountLockoutTimer from "./AccountLockoutTimer ";
import { toast } from "react-toastify";
const Loginpage = () => {
  const { login, currentUser, loading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginInProgress = useRef(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  // Account deactivation modal state
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [deactivationInfo, setDeactivationInfo] = useState({
    reason: "",
    deactivatedAt: "",
  });

  // Account lock modal state
  const [showAccountLockedModal, setShowAccountLockedModal] = useState(false);
  const [loginAttemptsInfo, setLoginAttemptsInfo] = useState({
    current: 0,
    max: 5,
  });

  // Account lockout timer state
  const [accountLockout, setAccountLockout] = useState({
    isLocked: false,
    lockoutExpiry: null,
    timeRemaining: 0,
  });

  // Maintenance mode modal state
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    message: "",
    estimatedTime: "",
  });

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#ECF3FF" }}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <div className="text-gray-800 text-lg mt-4 text-center">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLockoutExpired = () => {
    // Reset lockout state when timer expires
    setAccountLockout({
      isLocked: false,
      lockoutExpiry: null,
      timeRemaining: 0,
    });
    setMessage("Account unlocked! You can now try logging in again.");
  };

  const handleRetryLogin = () => {
    // Reset lockout state and clear messages
    setAccountLockout({
      isLocked: false,
      lockoutExpiry: null,
      timeRemaining: 0,
    });
    setMessage("");
    // Focus on the email input for user convenience
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) emailInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formLoading || loginInProgress.current) {
      return;
    }

    // Check if account is currently locked
    if (accountLockout.isLocked) {
      setMessage(
        "Please wait for the lockout timer to expire before trying again."
      );
      return;
    }

    loginInProgress.current = true;
    setFormLoading(true);
    setMessage("");

    try {
      const response = await login(formData);

      toast.success("Login Successfully ");

      // Reset lockout state on successful login
      setAccountLockout({
        isLocked: false,
        lockoutExpiry: null,
        timeRemaining: 0,
      });

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error codes from the backend
      if (error.code === "ACCOUNT_DEACTIVATED" || error.statusCode === 403) {
        // Extract deactivation information from the error object
        setDeactivationInfo({
          reason:
            error.deactivationReason ||
            error.response?.data?.deactivationReason ||
            "Account has been deactivated",
          deactivatedAt:
            error.deactivatedAt ||
            error.response?.data?.deactivatedAt ||
            "Unknown",
        });
        setShowDeactivatedModal(true);
        setMessage(""); // Clear any previous messages
      } else if (error.code === "ACCOUNT_LOCKED" || error.statusCode === 423) {
        // Handle account lock due to too many login attempts
        const errorData = error.response?.data;

        // Always try to set lockout timer state if lockout expiry is provided
        if (errorData?.lockoutExpiry || errorData?.data?.lockoutExpiry) {
          const lockoutExpiry =
            errorData?.lockoutExpiry || errorData?.data?.lockoutExpiry;
          const timeRemaining =
            errorData?.timeRemaining || errorData?.data?.timeRemaining || 0;

          setAccountLockout({
            isLocked: true,
            lockoutExpiry: lockoutExpiry,
            timeRemaining: timeRemaining,
          });

          setMessage(""); // Clear any previous messages
        } else {
          // Fallback: Create a lockout expiry time (e.g., 15 minutes from now)
          const lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
          const lockoutExpiry = new Date(
            Date.now() + lockoutDuration
          ).toISOString();

          setAccountLockout({
            isLocked: true,
            lockoutExpiry: lockoutExpiry,
            timeRemaining: lockoutDuration,
          });

          setMessage(""); // Clear any previous messages
        }
      } else if (
        error.message?.includes("maintenance") ||
        error.response?.data?.message?.includes("maintenance") ||
        error.response?.status === 503
      ) {
        // Handle maintenance mode error
        const maintenanceMessage =
          error.response?.data?.message ||
          error.message ||
          "We are currently under maintenance. Please check back later.";

        setMaintenanceInfo({
          message: maintenanceMessage,
          estimatedTime: error.response?.data?.estimatedTime || "Unknown",
        });
        setShowMaintenanceModal(true);
        setMessage(""); // Clear any previous messages
      } else if (error.response?.status === 401) {
        // Handle invalid credentials with login attempts info
        const errorData = error.response?.data;
        let errorMessage = "Invalid credentials.";

        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Check if the error response includes login attempts info
        if (
          errorData?.loginAttempts !== undefined ||
          errorData?.data?.loginAttempts !== undefined
        ) {
          const attempts =
            errorData?.loginAttempts || errorData?.data?.loginAttempts;
          const maxAttempts =
            errorData?.maxAttempts || errorData?.data?.maxAttempts || 5;

          setLoginAttemptsInfo({
            current: attempts,
            max: maxAttempts,
          });

          // Check if we've reached the maximum attempts
          if (attempts >= maxAttempts) {
            // Account should be locked - trigger lockout timer
            const lockoutDuration = 15 * 60 * 1000; // 15 minutes
            const lockoutExpiry = new Date(
              Date.now() + lockoutDuration
            ).toISOString();

            setAccountLockout({
              isLocked: true,
              lockoutExpiry: lockoutExpiry,
              timeRemaining: lockoutDuration,
            });

            setMessage(""); // Clear message since timer will show
          } else if (attempts >= maxAttempts - 1) {
            // Show warning for the last attempt
            errorMessage += ` Warning: Your account will be locked after ${
              maxAttempts - attempts
            } more failed attempt${maxAttempts - attempts !== 1 ? "s" : ""}.`;
            setMessage(errorMessage);
          } else {
            setMessage(errorMessage);
          }
        } else {
          setMessage(errorMessage);
        }
      } else if (error.response?.status === 404) {
        // User not found
        setMessage("User does not exist. Please check your email or sign up.");
      } else if (error.response?.status === 400) {
        // Bad request (missing fields)
        const errorMessage =
          error.response?.data?.message ||
          "Please fill in all required fields.";
        setMessage(errorMessage);
      } else {
        // Handle other login errors
        let errorMessage = "Login failed. Please try again.";

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setMessage(errorMessage);
      }
    } finally {
      setFormLoading(false);
      loginInProgress.current = false;
    }
  };

  // Forgot Password Functions
  const resetForgotPassword = () => {
    setForgotEmail("");
    setForgotMessage("");
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    resetForgotPassword();
  };

  const closeDeactivatedModal = () => {
    setShowDeactivatedModal(false);
    setDeactivationInfo({ reason: "", deactivatedAt: "" });
  };

  const closeAccountLockedModal = () => {
    setShowAccountLockedModal(false);
  };

  const closeMaintenanceModal = () => {
    setShowMaintenanceModal(false);
    setMaintenanceInfo({ message: "", estimatedTime: "" });
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");

    try {
      await forgotPassword(forgotEmail);
      setForgotMessage(
        "Password reset link has been sent to your email! Please check your inbox and follow the instructions."
      );
    } catch (error) {
      setForgotMessage(
        error?.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Unknown") return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#ECF3FF" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200 transform hover:scale-105 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Account Lockout Timer - Show this when account is locked */}
          {accountLockout.isLocked && (
            <div className="mb-6">
              <AccountLockoutTimer
                lockoutExpiry={accountLockout.lockoutExpiry}
                onLockoutExpired={handleLockoutExpired}
                onRetryLogin={handleRetryLogin}
                userEmail={formData.email}
                userName={formData.email} // Assuming email is used as username
              />
            </div>
          )}

          {/* Message Display - Only show when account is NOT locked */}
          {message && !accountLockout.isLocked && (
            <div
              className={`mb-6 p-4 rounded-2xl text-center text-sm font-medium transform transition-all duration-300 ${
                message.includes("Successfully") || message.includes("unlocked")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {message}
              {(message.toLowerCase().includes("login attempt") ||
                message.toLowerCase().includes("warning")) && (
                <div className="mt-2 text-xs">
                  <div className="flex items-center justify-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Attempts: {loginAttemptsInfo.current}/
                    {loginAttemptsInfo.max}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={accountLockout.isLocked}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={accountLockout.isLocked}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={accountLockout.isLocked}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                disabled={accountLockout.isLocked}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                formLoading ||
                loginInProgress.current ||
                accountLockout.isLocked
              }
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 relative overflow-hidden group"
            >
              {formLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                  Logging in...
                </div>
              ) : accountLockout.isLocked ? (
                <span className="relative z-10">Account Locked</span>
              ) : (
                <span className="relative z-10">Sign In</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-60 animate-bounce animation-delay-1000"></div>
        <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce animation-delay-3000"></div>
      </div>

      {/* Maintenance Mode Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <Wrench className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Under Maintenance
                </h3>
              </div>
              <button
                onClick={closeMaintenanceModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Maintenance Information */}
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                    System Maintenance in Progress
                  </h4>
                  <p className="text-yellow-700 text-sm">
                    {maintenanceInfo.message}
                  </p>
                </div>

                {maintenanceInfo.estimatedTime &&
                  maintenanceInfo.estimatedTime !== "Unknown" && (
                    <div className="flex items-center text-yellow-700">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Estimated completion: {maintenanceInfo.estimatedTime}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      What's happening?
                    </h4>
                    <p className="text-blue-700 text-sm">
                      We're performing scheduled maintenance to improve our
                      service. All user data is safe and will be available once
                      maintenance is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={closeMaintenanceModal}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-2xl transition-colors duration-200"
            >
              OK, I'll Check Back Later
            </button>
          </div>
        </div>
      )}

      {/* Account Deactivated Modal */}
      {showDeactivatedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Account Deactivated
                </h3>
              </div>
              <button
                onClick={closeDeactivatedModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Account Deactivation Information */}
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-red-800 mb-2">
                    Your account has been deactivated
                  </h4>
                  <p className="text-red-700 text-sm">
                    You cannot log in at this time because your account is
                    currently inactive.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-red-800">Reason: </span>
                    <span className="text-red-700">
                      {deactivationInfo.reason}
                    </span>
                  </div>

                  {deactivationInfo.deactivatedAt &&
                    deactivationInfo.deactivatedAt !== "Unknown" && (
                      <div>
                        <span className="font-medium text-red-800">
                          Deactivated on:{" "}
                        </span>
                        <span className="text-red-700">
                          {formatDate(deactivationInfo.deactivatedAt)}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
                <p className="text-blue-700 text-sm">
                  If you believe this is an error or would like to appeal this
                  decision, please contact our support team for assistance.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeDeactivatedModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-2xl transition-colors duration-200"
              >
                OK
              </button>
              <button
                onClick={() => {
                  closeDeactivatedModal();
                  // You can add navigation to support/contact page here
                  // navigate('/contact-support');
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-2xl transition-colors duration-200"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Locked Modal */}
      {showAccountLockedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Account Temporarily Locked
                </h3>
              </div>
              <button
                onClick={closeAccountLockedModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Account Lock Information */}
            <div className="mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-2">
                    Too many failed login attempts
                  </h4>
                  <p className="text-orange-700 text-sm">
                    Your account has been temporarily locked due to multiple
                    failed login attempts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-orange-100 p-3 rounded-xl">
                    <span className="text-orange-800 font-medium">
                      Login Attempts:
                    </span>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1 text-orange-600" />
                      <span className="text-orange-800 font-bold">
                        {loginAttemptsInfo.current}/{loginAttemptsInfo.max}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-orange-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Please wait a few minutes before trying again or reset
                      your password.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Security Tips
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>
                    • Make sure you're using the correct email and password
                  </li>
                  <li>• Check for caps lock or typing errors</li>
                  <li>• Try resetting your password if you've forgotten it</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeAccountLockedModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-2xl transition-colors duration-200"
              >
                OK
              </button>
              <button
                onClick={() => {
                  closeAccountLockedModal();
                  setShowForgotModal(true);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-2xl transition-colors duration-200"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Reset Password
              </h3>
              <button
                onClick={closeForgotModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Forgot Password Form */}
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              <div>
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Message Display */}
              {forgotMessage && (
                <div
                  className={`p-4 rounded-2xl text-center text-sm font-medium ${
                    forgotMessage.includes("sent")
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {forgotMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {forgotLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loginpage;
