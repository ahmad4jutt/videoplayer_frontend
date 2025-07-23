import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { resetPassword } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const { resetPassword, resetPasswordInProgress } = useAuth(); // Extract token from URL params
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!token || token.length < 10) {
      setTokenValid(false);
      setMessage(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(""); // Clear message when user types
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setMessage("");

    try {
      // Debug logging
      console.log("Reset password request:", {
        token: token,
        password: formData.password,
        url: `/api/v1/users/reset-password/${token}`,
      });

      // Call the context's reset password function
      await resetPassword(token, formData.password);

      setIsSuccess(true);
      setMessage(
        "Password reset successfully! You can now login with your new password."
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (error) {
      console.error("Reset password error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      setMessage(
        error?.response?.data?.message ||
          error.message ||
          "Failed to reset password. The link may have expired or is invalid."
      );
    }
  };

  // If token is invalid, show error state
  if (!tokenValid) {
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
          {/* Reset Password Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200 transform hover:scale-105 transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
                  isSuccess
                    ? "bg-gradient-to-br from-green-500 to-emerald-500"
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <Lock className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isSuccess ? "Success!" : "Reset Password"}
              </h2>
              <p className="text-gray-600">
                {isSuccess
                  ? "Your password has been updated"
                  : "Enter your new password"}
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-2xl text-center text-sm font-medium transform transition-all duration-300 ${
                  isSuccess || message.includes("successfully")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {/* Form - Hide after successful reset */}
            {!isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
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

                {/* Confirm Password Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li
                      className={
                        formData.password.length >= 6
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      At least 6 characters
                    </li>
                    <li
                      className={
                        formData.password === formData.confirmPassword &&
                        formData.password.length > 0
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      Passwords match
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={resetPasswordInProgress}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 relative overflow-hidden group"
                >
                  {resetPasswordInProgress ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    <span className="relative z-10">Reset Password</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </form>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Additional decorative elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-60 animate-bounce animation-delay-1000"></div>
          <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce animation-delay-3000"></div>
        </div>
      </div>
    );
  }

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
        {/* Reset Password Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gray-200 transform hover:scale-105 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
                isSuccess
                  ? "bg-gradient-to-br from-green-500 to-emerald-500"
                  : "bg-gradient-to-br from-blue-500 to-purple-500"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <Lock className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isSuccess ? "Success!" : "Reset Password"}
            </h2>
            <p className="text-gray-600">
              {isSuccess
                ? "Your password has been updated"
                : "Enter your new password"}
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-center text-sm font-medium transform transition-all duration-300 ${
                isSuccess || message.includes("successfully")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Form - Hide after successful reset */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="New password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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

              {/* Confirm Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li
                    className={
                      formData.password.length >= 6
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    At least 6 characters
                  </li>
                  <li
                    className={
                      formData.password === formData.confirmPassword &&
                      formData.password.length > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    Passwords match
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 relative overflow-hidden group"
              >
                {formLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  <span className="relative z-10">Reset Password</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-60 animate-bounce animation-delay-1000"></div>
        <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce animation-delay-3000"></div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
