import React, { useState, useContext } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the import path as needed

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

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

      console.log("Admin login successful", response);

      // Navigate to admin dashboard on successful login
      navigate("/admin/dashboard"); // Adjust the route as needed
    } catch (error) {
      console.error("Admin login failed:", error);

      // Handle different error scenarios
      if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setLoginError(
          "Invalid credentials. Please check your email and password."
        );
      } else if (error.response?.status === 403) {
        setLoginError("Access denied. You don't have admin privileges.");
      } else if (error.message) {
        setLoginError(error.message);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  const navigateToRegister = () => {
    navigate("/admin/register"); // Adjust the route as needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-300">Access the administrative dashboard</p>
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
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
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

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Need admin access?{" "}
              <button
                onClick={navigateToRegister}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                disabled={adminLoginInProgress}
              >
                Register here
              </button>
            </p>
          </div>
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
  );
};

export default AdminLogin;
