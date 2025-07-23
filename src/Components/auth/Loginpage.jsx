import React, { useState, useEffect, useRef } from "react";

import { useAuth } from "../../hooks/UseAuth";
import { forgotPassword } from "../../services/api";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, X, AlertTriangle } from "lucide-react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formLoading || loginInProgress.current) {
      console.log("login already in progress, skipping...");
      return;
    }
    loginInProgress.current = true;
    setFormLoading(true);
    setMessage("");

    try {
      console.log("start login progress");
      const response = await login(formData);
      const receivedToken = response.data.data.accessToken;
      console.log("Received token:", receivedToken);
      console.log("Login API response:", response.data);

      setMessage("Login Successfully ");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Login error:", error);

      // Check if the error is due to account deactivation
      if (
        error?.response?.data?.code === "ACCOUNT_DEACTIVATED" ||
        error?.response?.data?.message?.toLowerCase().includes("deactivated") ||
        error?.response?.data?.message?.toLowerCase().includes("inactive")
      ) {
        // Extract deactivation information from error response
        const errorData = error.response.data;
        setDeactivationInfo({
          reason:
            errorData.deactivationReason ||
            errorData.reason ||
            "Account has been deactivated",
          deactivatedAt: errorData.deactivatedAt || "Unknown",
        });
        setShowDeactivatedModal(true);
        setMessage(""); // Clear any previous messages
      } else {
        // Handle other login errors normally
        setMessage(
          error?.response?.data?.message || error.message || "Login failed."
        );
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

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-center text-sm font-medium transform transition-all duration-300 ${
                message.includes("Successfully")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {message}
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
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
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
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formLoading || loginInProgress.current}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 relative overflow-hidden group"
            >
              {formLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                  Logging in...
                </div>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Forgot Password
              </h3>
              <button
                onClick={closeForgotModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Message Display */}
            {forgotMessage && (
              <div
                className={`mb-6 p-4 rounded-2xl text-center text-sm font-medium ${
                  forgotMessage.includes("sent") ||
                  forgotMessage.includes("link")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {forgotMessage}
              </div>
            )}

            {/* Email Input Form */}
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-4">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {forgotLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-blue-800 text-sm">
                <strong>📧 Check your email:</strong> The reset link will expire
                in 10 minutes for security reasons.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loginpage;
