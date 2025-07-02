import React, { useState, useEffect } from "react";
import {
  Camera,
  Upload,
  User,
  Mail,
  Calendar,
  MapPin,
  Edit2,
  Save,
  X,
  Lock,
  AlertCircle,
} from "lucide-react";
import {
  getcurrentUser,
  updateAvatar,
  updateCoverImage,
  updateAccountDetails,
  changePassword,
} from "../../services/api";

import { useAuth } from "../../hooks/UseAuth";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ avatar: false, cover: false });
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { currentUser } = useAuth();
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    // Get token from localStorage or your auth context
    const authToken = localStorage.getItem("authToken") || "your-auth-token";
    setToken(authToken);
    loadUserData(authToken);
  }, []);

  const loadUserData = async (authToken) => {
    try {
      setLoading(true);
      const response = await getcurrentUser(authToken);
      const userData = response.data?.data || response.data;
      setUser(userData);
      setEditedUser({
        fullName: userData.fullName || "",
        email: userData.email || "",
        username: userData.username || "",
        // bio: userData.bio || "",
        // location: userData.location || "",
      });
      setErrors({});
    } catch (error) {
      console.error("Failed to load user data:", error);
      setErrors({ general: "Failed to load profile data" });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setErrors({ avatar: "Please select a valid image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setErrors({ avatar: "Image size should be less than 5MB" });
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, avatar: true }));
      setErrors({});
      const response = await updateAvatar(token, file);

      if (response.data.success) {
        setUser((prev) => ({
          ...prev,
          avatar: response.data.data.avatar || response.data.avatar,
        }));
        setSuccess("Avatar updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setErrors({
        avatar: error.response?.data?.message || "Failed to update avatar",
      });
    } finally {
      setUploading((prev) => ({ ...prev, avatar: false }));
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setErrors({ cover: "Please select a valid image file" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setErrors({ cover: "Image size should be less than 10MB" });
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, cover: true }));
      setErrors({});
      const response = await updateCoverImage(token, file);

      if (response.data.success) {
        setUser((prev) => ({
          ...prev,
          coverImage: response.data.data.coverImage || response.data.coverImage,
        }));
        setSuccess("Cover image updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update cover image:", error);
      setErrors({
        cover: error.response?.data?.message || "Failed to update cover image",
      });
    } finally {
      setUploading((prev) => ({ ...prev, cover: false }));
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      setEditedUser({
        fullName: user.fullName || "",
        email: user.email || "",
        username: user.username || "",
        // bio: user.bio || "",
        // location: user.location || "",
      });
    }
    setEditing(!editing);
    setErrors({});
  };

  const handleSave = async () => {
    try {
      setErrors({});
      const response = await updateAccountDetails(token, editedUser);

      if (response.data.success) {
        setUser((prev) => ({ ...prev, ...editedUser }));
        setEditing(false);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrors({
        general: error.response?.data?.message || "Failed to update profile",
        ...(error.response?.data?.errors || {}),
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      setErrors({});

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setErrors({
          newPassword: "Password must be at least 6 characters long",
        });
        return;
      }

      const response = await changePassword(token, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setSuccess("Password changed successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      setErrors({
        password: error.response?.data?.message || "Failed to change password",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}

      {/* Cover Image Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        {user?.coverImage && (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}

        {/* Cover Upload Button */}
        <div className="absolute top-4 right-4">
          <label className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-2">
            {uploading.cover ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Camera size={16} />
                Change Cover
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
              disabled={uploading.cover}
            />
          </label>
          {errors.cover && (
            <p className="text-red-500 text-sm mt-1 bg-white bg-opacity-90 px-2 py-1 rounded">
              {errors.cover}
            </p>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      {/* Profile Content */}
      <div className="relative -mt-32 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="px-6 py-8">
              {/* General Error Message */}
              {errors.general && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errors.general}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={40} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Avatar Upload Button */}
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors duration-200 shadow-lg">
                    {uploading.avatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera size={16} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading.avatar}
                    />
                  </label>
                  {errors.avatar && (
                    <p className="text-red-500 text-sm mt-1 absolute -bottom-6 left-0 w-32 text-center">
                      {errors.avatar}
                    </p>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedUser.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        placeholder="Full Name"
                        className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-600 focus:outline-none focus:border-blue-800 w-full"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user?.fullName || "User"}
                    </h1>
                  )}

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-gray-600 mt-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>@{user?.username}</span>
                    </div>
                    {user?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {editing ? (
                          <input
                            type="text"
                            value={editedUser.location}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            placeholder="Location"
                            className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-600"
                          />
                        ) : (
                          <span>{user.location}</span>
                        )}
                      </div>
                    )}
                    {user?.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEditToggle}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Lock size={16} />
                        Change Password
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  About
                </h2>
                {editing ? (
                  <div>
                    <textarea
                      value={editedUser.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {user?.bio || "No bio available"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>

            {errors.password && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.password}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      oldPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setErrors({});
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
