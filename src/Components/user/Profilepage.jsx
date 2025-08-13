import React, { useState, useEffect } from "react";
import {
  Camera,
  Edit,
  Save,
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Power,
  PowerOff,
  AlertTriangle,
} from "lucide-react";
import {
  getcurrentUser,
  updateAvatar,
  updateCoverImage,
  updateAccountDetails,
  changePassword,
  deleteAccount,
  deactivateAccount,
  reactivateAccount,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";

const Profilepage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    delete: false,
    deactivate: false,
    reactivate: false,
  });
  const [confirmText, setConfirmText] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [uploading, setUploading] = useState({ avatar: false, cover: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token, currentUser, logout } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const userData = await currentUser;
      setUser(userData);
      setFormData({
        fullName: userData.fullName,
        email: userData.email,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    setError("");
    setSuccess("");
    if (!editing) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!formData.fullName || !formData.email) {
        setError("Full name and email are required");
        return;
      }

      const response = await updateAccountDetails(token, formData);

      setUser((prev) => ({ ...prev, ...formData }));
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating account:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setError("");
      setSuccess("");

      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setError("All password fields are required");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("New password must be at least 6 characters long");
        return;
      }

      setLoading(true);

      await changePassword(token, passwordData);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update password");
      console.error("Error updating password:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type 'DELETE' to confirm account deletion");
      return;
    }

    if (!confirmPassword) {
      setError("Please enter your password to confirm account deletion");
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, delete: true }));
      setError("");
      setSuccess("");

      const deleteData = {
        password: confirmPassword,
      };

      await deleteAccount(token, deleteData);

      setSuccess("Account deleted successfully. Redirecting...");
      setTimeout(() => {
        logout();
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Delete account error in component:", error);
      setError(
        error.message || "Failed to delete account. Please check your password."
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, delete: false }));
      setShowDeleteModal(false);
      setConfirmText("");
      setConfirmPassword("");
    }
  };

  const handleReactivateAccount = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, reactivate: true }));
      setError("");
      setSuccess("");

      await reactivateAccount({ email: user.email });

      setSuccess("Account reactivated successfully!");
      fetchCurrentUser();
    } catch (error) {
      setError(error.message || "Failed to reactivate account");
      console.error("Error reactivating account:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, reactivate: false }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setError("");
        setSuccess("");

        setUploading((prev) => ({ ...prev, avatar: true }));

        const response = await updateAvatar(token, file);

        let avatarUrl = null;

        if (response.data) {
          avatarUrl =
            response.data.avatar ||
            response.data.data?.avatar ||
            response.data.data?.user?.avatar ||
            response.data.user?.avatar;
        }

        if (avatarUrl) {
          setUser((prev) => ({
            ...prev,
            avatar: avatarUrl,
          }));
          setSuccess("Avatar updated successfully!");
        } else {
          setError("Avatar URL not found in response");
        }
      } catch (error) {
        setError("Failed to update avatar");
        console.error("Error updating avatar:", error);
      } finally {
        setUploading((prev) => ({ ...prev, avatar: false }));
      }
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setError("");
        setSuccess("");

        if (!file.type.startsWith("image/")) {
          setError("Please select a valid image file");
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          setError("Image size should be less than 10MB");
          return;
        }

        setUploading((prev) => ({ ...prev, cover: true }));

        const response = await updateCoverImage(token, file);

        setUser((prev) => ({
          ...prev,
          coverImage: response.data.data.coverImage,
        }));
        setSuccess("Cover image updated successfully!");
      } catch (error) {
        setError("Failed to update cover image");
        console.error("Error updating cover image:", error);
      } finally {
        setUploading((prev) => ({ ...prev, cover: false }));
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setConfirmText("");
    setConfirmPassword("");
    setError("");
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={`rounded-2xl max-w-md w-full p-6 shadow-2xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`p-1 ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  if (loading && !user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
        }`}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mx-auto mb-4 ${
              isDarkMode ? "border-indigo-400" : "border-indigo-600"
            }`}
          ></div>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      }`}
    >
      {/* Alert Messages */}
      {(error || success) && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div
            className={`p-4 rounded-lg shadow-lg ${
              error
                ? isDarkMode
                  ? "bg-red-900 border border-red-700 text-red-200"
                  : "bg-red-100 border border-red-400 text-red-700"
                : isDarkMode
                ? "bg-green-900 border border-green-700 text-green-200"
                : "bg-green-100 border border-green-400 text-green-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{error || success}</span>
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                }}
                className={`ml-2 ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              isDarkMode ? "bg-red-900/30" : "bg-red-50"
            }`}
          >
            <AlertTriangle className="text-red-600" size={24} />
            <div>
              <p
                className={`font-medium ${
                  isDarkMode ? "text-red-300" : "text-red-800"
                }`}
              >
                This action cannot be undone
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                Your account and all data will be permanently deleted
              </p>
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Enter your password to confirm:
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Type "DELETE" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="DELETE"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseDeleteModal}
              className={`flex-1 px-4 py-2 border rounded-lg ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={
                actionLoading.delete ||
                confirmText !== "DELETE" ||
                !confirmPassword
              }
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading.delete ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Header with Cover Image */}
      <div className="relative">
        <div
          className={`h-72 relative overflow-hidden ${
            isDarkMode
              ? "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
          }`}
        >
          {user?.coverImage && (
            <div className="absolute inset-0">
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-gray-900/40 via-gray-800/40 to-gray-900/40"
                    : "bg-gradient-to-r from-gray-900/30 via-gray-900/30 to-gray-900/30"
                }`}
              ></div>
            </div>
          )}

          {/* Cover Upload Button */}
          <div className="absolute top-6 right-6 z-10">
            <label
              className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 flex items-center gap-2 backdrop-blur-sm ${
                isDarkMode
                  ? "bg-gray-800/80 text-gray-200 hover:bg-gray-700/80"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Camera size={18} />
              <span className="text-sm font-medium">
                {uploading.cover ? "Uploading..." : "Change Cover"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
                disabled={uploading.cover}
              />
            </label>
          </div>

          {uploading.cover && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
                <p className="text-lg font-medium">Uploading cover image...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        {/* Profile Header Card */}
        <div
          className={`rounded-3xl shadow-xl border p-8 mb-8 ${
            isDarkMode
              ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/50"
              : "bg-white/80 backdrop-blur-sm border-white/20"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div
                className={`w-36 h-36 rounded-full border-4 shadow-2xl overflow-hidden ${
                  isDarkMode
                    ? "border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800"
                    : "border-white bg-gradient-to-br from-gray-200 to-gray-100"
                }`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isDarkMode
                        ? "bg-gradient-to-br from-gray-600 to-gray-700"
                        : "bg-gradient-to-br from-indigo-400 to-purple-400"
                    }`}
                  >
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>

              <label
                className={`absolute bottom-2 right-2 p-3 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isDarkMode
                    ? "bg-indigo-500 hover:bg-indigo-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white`}
              >
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading.avatar}
                />
              </label>

              {uploading.avatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className={`text-4xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {user?.fullName}
              </h1>
              <p
                className={`text-lg mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {user?.email}
              </p>
              <p
                className={`font-medium text-sm ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                {user?.role}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDarkMode
                      ? "bg-indigo-900 text-indigo-300"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDarkMode
                      ? "bg-green-900 text-green-300"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  Current session {new Date().toLocaleDateString()}
                </span>
                {user?.isActive === false && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDarkMode
                        ? "bg-red-900 text-red-300"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    Account Deactivated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`rounded-2xl shadow-lg border mb-8 ${
            isDarkMode
              ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/50"
              : "bg-white/80 backdrop-blur-sm border-white/20"
          }`}
        >
          <div className="flex overflow-x-auto">
            {[
              { id: "profile", label: "Profile Info", icon: User },
              { id: "security", label: "Security", icon: Shield },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 border-b-2 ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? "text-indigo-400 border-indigo-400 bg-indigo-900/30"
                      : "text-indigo-600 border-indigo-600 bg-indigo-50"
                    : isDarkMode
                    ? "text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-900/20"
                    : "text-gray-600 border-transparent hover:text-indigo-500 hover:bg-indigo-50/50"
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div
          className={`rounded-2xl shadow-lg border p-8 ${
            isDarkMode
              ? "bg-gray-800/90 backdrop-blur-sm border-gray-700/50"
              : "bg-white/80 backdrop-blur-sm border-white/20"
          }`}
        >
          {activeTab === "profile" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Profile Information
                </h2>
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
                    isDarkMode
                      ? "bg-indigo-500 hover:bg-indigo-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white`}
                >
                  {editing ? <X size={18} /> : <Edit size={18} />}
                  {editing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {editing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      <Save size={18} />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-indigo-900" : "bg-indigo-100"
                        }`}
                      >
                        <User
                          className={`${
                            isDarkMode ? "text-indigo-400" : "text-indigo-600"
                          }`}
                          size={24}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Full Name
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {user?.fullName}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-purple-900" : "bg-purple-100"
                        }`}
                      >
                        <Mail
                          className={`${
                            isDarkMode ? "text-purple-400" : "text-purple-600"
                          }`}
                          size={24}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Email Address
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-green-900" : "bg-green-100"
                        }`}
                      >
                        <Calendar
                          className={`${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                          size={24}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Member Since
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {new Date(user?.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-blue-900" : "bg-blue-100"
                        }`}
                      >
                        <Shield
                          className={`${
                            isDarkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                          size={24}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Account Status
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {user?.isActive ? "Active" : "Deactivated"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Security Settings
              </h2>

              <div className="space-y-8">
                {/* Change Password Section */}
                <div
                  className={`rounded-xl p-6 ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 pr-12 ${
                            isDarkMode
                              ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          New Password *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                            isDarkMode
                              ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                            isDarkMode
                              ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordUpdate}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      <Shield size={18} />
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Account Settings
              </h2>

              <div className="space-y-8">
                {/* Account Actions */}
                <div
                  className={`rounded-xl p-6 ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Account Actions
                  </h3>
                  <div className="space-y-4">
                    {/* Reactivate Account (only show if account is deactivated) */}
                    {user?.isActive === false && (
                      <div
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isDarkMode
                            ? "bg-green-900/20 border-green-700"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Power
                            className={`${
                              isDarkMode ? "text-green-400" : "text-green-600"
                            }`}
                            size={24}
                          />
                          <div>
                            <p
                              className={`font-medium ${
                                isDarkMode ? "text-green-300" : "text-green-800"
                              }`}
                            >
                              Reactivate Account
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-green-400" : "text-green-600"
                              }`}
                            >
                              Restore your account to active status
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleReactivateAccount}
                          disabled={actionLoading.reactivate}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50"
                        >
                          {actionLoading.reactivate
                            ? "Reactivating..."
                            : "Reactivate"}
                        </button>
                      </div>
                    )}

                    {/* Delete Account */}
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isDarkMode
                          ? "bg-red-900/20 border-red-700"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Trash2
                          className={`${
                            isDarkMode ? "text-red-400" : "text-red-600"
                          }`}
                          size={24}
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              isDarkMode ? "text-red-300" : "text-red-800"
                            }`}
                          >
                            Delete Account
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            Permanently delete your account and all data
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profilepage;
