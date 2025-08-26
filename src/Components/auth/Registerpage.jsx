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
    <div className="min-h-screen bg-gradient-to-br bg-black flex items-center justify-center p-2">
      <div className="w-full max-w-3xl">
        <div className="bg-black/90 backdrop-blur-sm border border-red-500/20 rounded-lg overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

          <div className="p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Create Account
              </h1>
              <p className="text-gray-400 text-sm">Sign up to get started</p>
            </div>

            {/* General Error Message */}
            {generalError && (
              <div className="mb-3 p-3 rounded border-l-4 bg-red-500/10 border-red-500 text-red-400">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-xs">{generalError}</p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Main Grid - Two Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Avatar and Cover Image */}
                <div className="space-y-3">
                  {/* Avatar Upload */}
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Profile Picture *
                    </label>
                    <div className="mb-2">
                      {avatarPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className={`mx-auto h-16 w-16 rounded-full object-cover border-2 ${
                              hasFieldError("avatar")
                                ? "border-red-500/50"
                                : "border-red-500/50"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            disabled={loading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`mx-auto h-16 w-16 bg-gray-900/80 rounded-full flex items-center justify-center border-2 border-dashed ${
                            hasFieldError("avatar")
                              ? "border-red-500/50"
                              : "border-red-500/30"
                          }`}
                        >
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-red-500/30 rounded-lg text-xs font-medium text-gray-300 bg-gray-900/50 hover:bg-red-500/10 transition-colors">
                      <Upload className="h-3 w-3 mr-1" />
                      {avatarPreview ? "Change Avatar" : "Upload Avatar"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Required (Max 5MB)
                    </p>
                    {getFieldError("avatar") && (
                      <p className="text-red-400 text-xs mt-1">
                        {getFieldError("avatar")}
                      </p>
                    )}
                  </div>

                  {/* Cover Image Upload */}
                  <div className="text-center">
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Cover Image
                    </label>
                    <div className="mb-2">
                      {coverImagePreview ? (
                        <div className="relative w-full">
                          <img
                            src={coverImagePreview}
                            alt="Cover preview"
                            className={`w-full h-22 rounded-lg object-fit border-2 ${
                              hasFieldError("coverImage")
                                ? "border-red-500/50"
                                : "border-red-500/50"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            disabled={loading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`w-full h-20 bg-gray-900/80 rounded-lg flex items-center justify-center border-2 border-dashed ${
                            hasFieldError("coverImage")
                              ? "border-red-500/50"
                              : "border-red-500/30"
                          }`}
                        >
                          <div className="text-center">
                            <Upload className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                            <span className="text-gray-500 text-xs">
                              Cover Image
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-red-500/30 rounded-lg text-xs font-medium text-gray-300 bg-gray-900/50 hover:bg-red-500/10 transition-colors">
                      <Upload className="h-3 w-3 mr-1" />
                      {coverImagePreview ? "Change Cover" : "Upload Cover"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden object-cover  "
                        disabled={loading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Optional (Max 10MB)
                    </p>
                    {getFieldError("coverImage") && (
                      <p className="text-red-400 text-xs mt-1">
                        {getFieldError("coverImage")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-900/50 border rounded-lg pl-8 pr-2.5 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          hasFieldError("fullName")
                            ? "border-red-500/50"
                            : "border-gray-700"
                        }`}
                        placeholder="Full Name *"
                        required
                        disabled={loading}
                      />
                    </div>
                    {getFieldError("fullName") && (
                      <p className="text-red-400 text-xs mt-1">
                        {getFieldError("fullName")}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-900/50 border rounded-lg pl-8 pr-2.5 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          hasFieldError("userName")
                            ? "border-red-500/50"
                            : "border-gray-700"
                        }`}
                        placeholder="Username *"
                        required
                        disabled={loading}
                      />
                    </div>
                    {!getFieldError("userName") && (
                      <p className="text-xs text-gray-500 mt-1">
                        Min 3 chars, letters, numbers, underscores only
                      </p>
                    )}
                    {getFieldError("userName") && (
                      <p className="text-red-400 text-xs mt-1">
                        {getFieldError("userName")}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-900/50 border rounded-lg pl-8 pr-2.5 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          hasFieldError("email")
                            ? "border-red-500/50"
                            : "border-gray-700"
                        }`}
                        placeholder="Email Address *"
                        required
                        disabled={loading}
                      />
                    </div>
                    {getFieldError("email") && (
                      <p className="text-red-400 text-xs mt-1">
                        {getFieldError("email")}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-900/50 border rounded-lg pl-8 pr-10 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          hasFieldError("password")
                            ? "border-red-500/50"
                            : "border-gray-700"
                        }`}
                        placeholder="Password *"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors duration-300"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {!getFieldError("password") && (
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 6 characters
                      </p>
                    )}
                    {getFieldError("password") && (
                      <p className="text-red-400 text-xs mt-1">
                        {getFieldError("password")}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-900/50 border rounded-lg pl-8 pr-10 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                          hasFieldError("confirmPassword")
                            ? "border-red-500/50"
                            : "border-gray-700"
                        }`}
                        placeholder="Confirm Password *"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors duration-300"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {getFieldError("confirmPassword") && (
                      <p className="text-red-400 text-xs mt-1">
                        {getFieldError("confirmPassword")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button - Full Width */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-lg transition-all duration-300 group-hover:from-red-500 group-hover:to-red-600"></div>
                <div className="relative px-4 py-2.5 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </div>
                  )}
                </div>
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-3 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-red-400 hover:text-red-300 font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
export default Registerpage;
