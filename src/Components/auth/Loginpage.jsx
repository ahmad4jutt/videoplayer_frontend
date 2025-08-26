import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { forgotPassword } from "../../services/api";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Play,
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

  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [deactivationInfo, setDeactivationInfo] = useState({
    reason: "",
    deactivatedAt: "",
  });

  const [showAccountLockedModal, setShowAccountLockedModal] = useState(false);
  const [loginAttemptsInfo, setLoginAttemptsInfo] = useState({
    current: 0,
    max: 5,
  });

  const [accountLockout, setAccountLockout] = useState({
    isLocked: false,
    lockoutExpiry: null,
    timeRemaining: 0,
  });

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    message: "",
    estimatedTime: "",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 border-2 border-red-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-t-red-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-white text-sm mt-3 text-center">Loading...</div>
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
    setAccountLockout({
      isLocked: false,
      lockoutExpiry: null,
      timeRemaining: 0,
    });
    setMessage("Account unlocked! You can now try logging in again.");
  };

  const handleRetryLogin = () => {
    setAccountLockout({
      isLocked: false,
      lockoutExpiry: null,
      timeRemaining: 0,
    });
    setMessage("");
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) emailInput.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formLoading || loginInProgress.current) {
      return;
    }

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

      if (error.code === "ACCOUNT_DEACTIVATED" || error.statusCode === 403) {
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
        setMessage("");
      } else if (error.code === "ACCOUNT_LOCKED" || error.statusCode === 423) {
        const errorData = error.response?.data;

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

          setMessage("");
        } else {
          const lockoutDuration = 5 * 60 * 1000;
          const lockoutExpiry = new Date(
            Date.now() + lockoutDuration
          ).toISOString();

          setAccountLockout({
            isLocked: true,
            lockoutExpiry: lockoutExpiry,
            timeRemaining: lockoutDuration,
          });

          setMessage("");
        }
      } else if (
        error.message?.includes("maintenance") ||
        error.response?.data?.message?.includes("maintenance") ||
        error.response?.status === 503
      ) {
        const maintenanceMessage =
          error.response?.data?.message ||
          error.message ||
          "We are currently under maintenance. Please check back later.";

        setMaintenanceInfo({
          message: maintenanceMessage,
          estimatedTime: error.response?.data?.estimatedTime || "Unknown",
        });
        setShowMaintenanceModal(true);
        setMessage("");
      } else if (error.response?.status === 401) {
        const errorData = error.response?.data;
        let errorMessage = "Invalid credentials.";

        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

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

          if (attempts >= maxAttempts) {
            const lockoutDuration = 5 * 60 * 1000;
            const lockoutExpiry = new Date(
              Date.now() + lockoutDuration
            ).toISOString();

            setAccountLockout({
              isLocked: true,
              lockoutExpiry: lockoutExpiry,
              timeRemaining: lockoutDuration,
            });

            setMessage("");
          } else if (attempts >= maxAttempts - 1) {
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
        setMessage("User does not exist. Please check your email or sign up.");
      } else if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          "Please fill in all required fields.";
        setMessage(errorMessage);
      } else {
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
      setForgotMessage("Password reset link has been sent to your email!");
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-black"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-65 bg-gradient-radial from-red-600/10 to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Compact Login Container */}
          <div className="bg-black/90 backdrop-blur-sm border border-red-500/20 rounded-lg overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

            <div className="p-6">
              {/* Compact Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play
                      className="w-5 h-5 text-white ml-0.5"
                      fill="currentColor"
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Welcome Back
                </h1>
                <p className="text-gray-400 text-sm">Sign in to continue</p>
              </div>

              {/* Account Lockout Timer */}
              {accountLockout.isLocked && (
                <div className="mb-4">
                  <AccountLockoutTimer
                    lockoutExpiry={accountLockout.lockoutExpiry}
                    onLockoutExpired={handleLockoutExpired}
                    onRetryLogin={handleRetryLogin}
                    userEmail={formData.email}
                    userName={formData.email}
                  />
                </div>
              )}

              {/* Compact Message Display */}
              {message && !accountLockout.isLocked && (
                <div
                  className={`mb-4 p-3 rounded border-l-4 text-center text-xs ${
                    message.includes("Successfully") ||
                    message.includes("unlocked")
                      ? "bg-green-500/10 border-green-500 text-green-400"
                      : "bg-red-500/10 border-red-500 text-red-400"
                  }`}
                >
                  {message}
                  {(message.toLowerCase().includes("login attempt") ||
                    message.toLowerCase().includes("warning")) && (
                    <div className="mt-1 text-xs opacity-80">
                      <div className="flex items-center justify-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Attempts: {loginAttemptsInfo.current}/
                        {loginAttemptsInfo.max}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Compact Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={accountLockout.isLocked}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded pl-10 pr-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    placeholder="Email"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={accountLockout.isLocked}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={accountLockout.isLocked}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    disabled={accountLockout.isLocked}
                    className="text-red-400 hover:text-red-300 text-xs transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Compact Submit Button */}
                <button
                  type="submit"
                  disabled={
                    formLoading ||
                    loginInProgress.current ||
                    accountLockout.isLocked
                  }
                  className="w-full relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded transition-all duration-300 group-hover:from-red-500 group-hover:to-red-600"></div>
                  <div className="relative px-6 py-3 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                    {formLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : accountLockout.isLocked ? (
                      "Account Locked"
                    ) : (
                      <div className="flex items-center justify-center">
                        <Play className="w-4 h-4 mr-2" fill="currentColor" />
                        Sign In
                      </div>
                    )}
                  </div>
                </button>
              </form>

              {/* Compact Footer */}
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-xs">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-red-400 hover:text-red-300 font-medium transition-colors duration-300"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Compact Modals */}
      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded flex items-center justify-center mr-3">
                  <Wrench className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Maintenance</h3>
              </div>
              <button
                onClick={closeMaintenanceModal}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
                <p className="text-yellow-200/80 text-sm">
                  {maintenanceInfo.message}
                </p>
                {maintenanceInfo.estimatedTime &&
                  maintenanceInfo.estimatedTime !== "Unknown" && (
                    <div className="flex items-center text-yellow-200/80 mt-2">
                      <Clock className="w-3 h-3 mr-2" />
                      <span className="text-xs">
                        ETA: {maintenanceInfo.estimatedTime}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <button
              onClick={closeMaintenanceModal}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-semibold py-2 px-4 rounded transition-all duration-300 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Account Deactivated Modal */}
      {showDeactivatedModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500/20 border border-red-500/30 rounded flex items-center justify-center mr-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Account Deactivated
                </h3>
              </div>
              <button
                onClick={closeDeactivatedModal}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                <p className="text-red-200/80 text-sm mb-2">
                  Your account has been deactivated.
                </p>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-red-300 text-xs">
                      Reason:{" "}
                    </span>
                    <span className="text-red-200/80 text-xs">
                      {deactivationInfo.reason}
                    </span>
                  </div>
                  {deactivationInfo.deactivatedAt &&
                    deactivationInfo.deactivatedAt !== "Unknown" && (
                      <div>
                        <span className="font-medium text-red-300 text-xs">
                          Date:{" "}
                        </span>
                        <span className="text-red-200/80 text-xs">
                          {formatDate(deactivationInfo.deactivatedAt)}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeDeactivatedModal}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded transition-all duration-300 text-sm"
              >
                OK
              </button>
              <button
                onClick={closeDeactivatedModal}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-2 px-3 rounded transition-all duration-300 text-sm"
              >
                Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Locked Modal */}
      {showAccountLockedModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500/20 border border-orange-500/30 rounded flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Account Locked</h3>
              </div>
              <button
                onClick={closeAccountLockedModal}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded p-4">
                <p className="text-orange-200/80 text-sm mb-2">
                  Too many failed login attempts.
                </p>
                <div className="flex items-center justify-between bg-orange-500/10 p-2 rounded border border-orange-500/20">
                  <span className="text-orange-300 text-xs">Attempts:</span>
                  <div className="flex items-center">
                    <Shield className="w-3 h-3 mr-1 text-orange-400" />
                    <span className="text-orange-300 font-bold text-xs">
                      {loginAttemptsInfo.current}/{loginAttemptsInfo.max}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeAccountLockedModal}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded transition-all duration-300 text-sm"
              >
                OK
              </button>
              <button
                onClick={() => {
                  closeAccountLockedModal();
                  setShowForgotModal(true);
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-2 px-3 rounded transition-all duration-300 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Reset Password</h3>
              <button
                onClick={closeForgotModal}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs mb-3">
                  Enter your email address and we'll send you a reset link.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded pl-10 pr-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 text-sm"
                />
              </div>

              {forgotMessage && (
                <div
                  className={`p-3 rounded border-l-4 text-center text-xs ${
                    forgotMessage.includes("sent")
                      ? "bg-green-500/10 border-green-500 text-green-400"
                      : "bg-red-500/10 border-red-500 text-red-400"
                  }`}
                >
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded transition-all duration-300 group-hover:from-red-500 group-hover:to-red-600"></div>
                <div className="relative px-6 py-3 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                  {forgotLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </div>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="text-red-400 hover:text-red-300 text-xs transition-colors duration-300"
                >
                  Back to Sign In
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
