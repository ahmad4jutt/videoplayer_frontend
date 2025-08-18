import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Upload,
  UserPlus,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

const Registerpage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    avatar: null,
    coverImage: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        const errorMsg = "Please select a valid image file for avatar";
        setErrors((prev) => ({
          ...prev,
          avatar: errorMsg,
        }));
        toast.error(errorMsg);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = "Avatar image should be less than 5MB";
        setErrors((prev) => ({
          ...prev,
          avatar: errorMsg,
        }));
        toast.error(errorMsg);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
      // Clear avatar error
      setErrors((prev) => ({ ...prev, avatar: "" }));
      toast.success("Avatar uploaded successfully");
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        const errorMsg = "Please select a valid image file for cover image";
        setErrors((prev) => ({
          ...prev,
          coverImage: errorMsg,
        }));
        toast.error(errorMsg);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        const errorMsg = "Cover image size should be less than 10MB";
        setErrors((prev) => ({
          ...prev,
          coverImage: errorMsg,
        }));
        toast.error(errorMsg);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => setCoverImagePreview(e.target.result);
      reader.readAsDataURL(file);
      // Clear cover image error
      setErrors((prev) => ({ ...prev, coverImage: "" }));
      toast.success("Cover image uploaded successfully");
    }
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
    toast.info("Avatar removed");
  };

  const removeCoverImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: null }));
    setCoverImagePreview(null);
    toast.info("Cover image removed");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.avatar) newErrors.avatar = "Avatar is required";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (formData.userName.trim() && !usernameRegex.test(formData.userName)) {
      newErrors.userName =
        "Username can only contain letters, numbers, and underscores";
    }

    if (formData.userName.trim() && formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters long";
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone =
          "Please enter a valid phone number start with your country region";
      }
    }

    return newErrors;
  };

  const handleBackendErrors = (error) => {
    // Clear previous errors
    setErrors({});
    setGeneralError("");

    if (error.response?.data) {
      const backendError = error.response.data;

      // Handle validation errors (field-specific errors)
      if (backendError.errors && Array.isArray(backendError.errors)) {
        const fieldErrors = {};
        backendError.errors.forEach((err) => {
          if (err.field) {
            const errorMessage = err.message || err.msg || "Invalid value";
            fieldErrors[err.field] = errorMessage;
            toast.error(`${err.field}: ${errorMessage}`);
          }
        });
        setErrors(fieldErrors);

        // If there are non-field errors, show them as general error
        const nonFieldErrors = backendError.errors.filter((err) => !err.field);
        if (nonFieldErrors.length > 0) {
          const errorMessage =
            nonFieldErrors[0].message ||
            nonFieldErrors[0].msg ||
            "Registration failed";
          setGeneralError(errorMessage);
          toast.error(errorMessage);
        }
      }
      // Handle object-based validation errors (e.g., { email: "Email already exists" })
      else if (backendError.errors && typeof backendError.errors === "object") {
        setErrors(backendError.errors);
        // Show toast for each field error
        Object.entries(backendError.errors).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      }
      // Handle single message errors
      else if (backendError.message) {
        // Check if it's a specific field error based on message content
        const message = backendError.message;
        if (message.toLowerCase().includes("email")) {
          setErrors({ email: message });
          toast.error(`Email: ${message}`);
        } else if (message.toLowerCase().includes("username")) {
          setErrors({ userName: message });
          toast.error(`Username: ${message}`);
        } else if (message.toLowerCase().includes("phone")) {
          setErrors({ phone: message });
          toast.error(`Phone: ${message}`);
        } else {
          setGeneralError(message);
          toast.error(message);
        }
      }
      // Handle error property
      else if (backendError.error) {
        setGeneralError(backendError.error);
        toast.error(backendError.error);
      }
      // Handle status-based errors
      else {
        handleStatusBasedErrors(error.response.status);
      }
    } else {
      // Handle network and other errors
      let errorMessage = "Registration failed. Please try again.";

      if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.code === "ECONNREFUSED") {
        errorMessage = "Unable to connect to server. Please try again later.";
      }

      setGeneralError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleStatusBasedErrors = (status) => {
    let errorMessage = "Registration failed. Please try again.";

    switch (status) {
      case 400:
        errorMessage =
          "Invalid form data. Please check all fields and try again.";
        break;
      case 409:
        errorMessage = "User already exists with this email or username";
        break;
      case 422:
        errorMessage =
          "Invalid input data. Please check your information and try again.";
        break;
      case 500:
        errorMessage = "Server error. Please try again later.";
        break;
      case 503:
        errorMessage =
          "Service temporarily unavailable. Please try again later.";
        break;
    }

    setGeneralError(errorMessage);
    toast.error(errorMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show toast for validation errors
      Object.entries(validationErrors).forEach(([field, message]) => {
        toast.error(`${field}: ${message}`);
      });
      return;
    }

    setLoading(true);
    setErrors({});
    setGeneralError("");

    try {
      const submitFormData = new FormData();
      submitFormData.append("fullName", formData.fullName.trim());
      submitFormData.append("userName", formData.userName.trim().toLowerCase());
      submitFormData.append("email", formData.email.trim().toLowerCase());
      submitFormData.append("password", formData.password);

      if (formData.phone && formData.phone.trim()) {
        submitFormData.append("phone", formData.phone.trim());
      }

      // Avatar is required according to backend
      submitFormData.append("avatar", formData.avatar);

      if (formData.coverImage) {
        submitFormData.append("coverImage", formData.coverImage);
      }

      const response = await registerUser(submitFormData);

      // Auto-login after successful registration
      try {
        await login({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });
        navigate("/");
        toast.success("Registration successful! Welcome!");
      } catch (loginError) {
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please log in with your credentials.",
          },
        });
        toast.success("Registration successful! Please log in.");
      }
    } catch (error) {
      handleBackendErrors(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get error for a field
  const getFieldError = (fieldName) => {
    return errors[fieldName] || "";
  };

  // Helper function to check if field has error
  const hasFieldError = (fieldName) => {
    return !!errors[fieldName];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Sign up to get started</p>
          </div>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{generalError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload - Required */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture *
              </label>
              <div className="mb-4">
                {avatarPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className={`mx-auto h-20 w-20 rounded-full object-cover border-4 ${
                        hasFieldError("avatar")
                          ? "border-red-300"
                          : "border-indigo-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mx-auto h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed ${
                      hasFieldError("avatar")
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  >
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                {avatarPreview ? "Change Avatar" : "Upload Avatar"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Required (Max 5MB)</p>
              {getFieldError("avatar") && (
                <p className="text-red-500 text-sm mt-1">
                  {getFieldError("avatar")}
                </p>
              )}
            </div>

            {/* Cover Image Upload - Optional */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="mb-4">
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover image preview"
                      className={`mx-auto w-full h-32 rounded-lg object-cover border-4 ${
                        hasFieldError("coverImage")
                          ? "border-red-300"
                          : "border-indigo-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mx-auto w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed ${
                      hasFieldError("coverImage")
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-500 text-sm">Cover Image</span>
                    </div>
                  </div>
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                {coverImagePreview ? "Change Cover" : "Upload Cover Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Optional (Max 10MB)</p>
              {getFieldError("coverImage") && (
                <p className="text-red-500 text-sm mt-1">
                  {getFieldError("coverImage")}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    hasFieldError("fullName")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
              {getFieldError("fullName") && (
                <p className="text-red-500 text-sm mt-1">
                  {getFieldError("fullName")}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    hasFieldError("userName")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Choose a unique username"
                  required
                  disabled={loading}
                />
              </div>
              {!getFieldError("userName") && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 3 characters, letters, numbers, and underscores only
                </p>
              )}
              {getFieldError("userName") && (
                <p className="text-red-500 text-sm mt-1">
                  {getFieldError("userName")}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    hasFieldError("email")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              {getFieldError("email") && (
                <p className="text-red-500 text-sm mt-1">
                  {getFieldError("email")}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    hasFieldError("password")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!getFieldError("password") && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              )}
              {getFieldError("password") && (
                <p className="text-red-500 text-sm mt-1">
                  {getFieldError("password")}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    hasFieldError("confirmPassword")
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {getFieldError("confirmPassword") && (
                <p className="text-red-500 text-sm mt-1">
                  {getFieldError("confirmPassword")}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registerpage;
