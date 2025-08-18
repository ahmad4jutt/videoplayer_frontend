import axios from "axios";
//USER routes

const VIDEO_BASE_URL = "http://localhost:8000/api/v1/videos/";
const COMMENT_BASE_URL = "http://localhost:8000/api/v1/comments";
const DASHBOARD_BASE_URL = "http://localhost:8000/api/v1/dashboard";
const PLAYLIST_BASE_URL = "http://localhost:8000/api/v1/playlists";
const LIKE_BASE_URL = "http://localhost:8000/api/v1/likes";
const SUBSCRIPTION_BASE_URL = "http://localhost:8000/api/v1/subscriptions";
const HEALTHCHECK_BASE_URL = "http://localhost:8000/api/v1/healthcheck";
const USER_BASE_URL = "http://localhost:8000/api/v1/users";
const ADMIN_BASE_URL = "http://localhost:8000/api/v1/users/admin";

export const registerUser = (formData) =>
  axios.post(`${USER_BASE_URL}/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const loginUser = (data) => axios.post(`${USER_BASE_URL}/login`, data);
export const checkLockoutStatus = (data) => {
  return axios.post(`${USER_BASE_URL}/check-lockout-status`, data);
};
export const logoutUser = (token) =>
  axios.post(
    `${USER_BASE_URL}/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
export const forgotPassword = (email) => {
  return axios.post(`${USER_BASE_URL}/forget-password`, { email });
};
export const resetPassword = (token, password) => {
  return axios.post(`${USER_BASE_URL}/reset-password/${token}`, {
    password: password, // Wrap the password in an object
    confirmPassword: password,
  });
};
export const deleteAccount = async (token, data) => {
  try {
    const response = await axios.delete(`${USER_BASE_URL}/delete-account`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: data, // Send the password in the request body
    });
    return response.data;
  } catch (error) {
    console.error("Delete account error:", error);
    // Extract error message from response
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete account";
    throw new Error(errorMessage);
  }
};

export const deactivateAccount = async (token, data) => {
  try {
    const response = await axios.post(
      `${USER_BASE_URL}/deactivate-account`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Deactivate account error:", error);
    // Extract error message from response
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to deactivate account";
    throw new Error(errorMessage);
  }
};

export const reactivateAccount = (data) =>
  axios.post(`${USER_BASE_URL}/reactivate-account`, data);
export const getcurrentUser = (token) =>
  axios.get(
    `${USER_BASE_URL}/current-user`,

    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const changePassword = (token, data) =>
  axios.post(`${USER_BASE_URL}/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAccountDetails = (token, data) =>
  axios.patch(`${USER_BASE_URL}/update-account`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAvatar = (token, avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  return axios.patch(`${USER_BASE_URL}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCoverImage = (token, coverFile) => {
  const formData = new FormData();
  formData.append("coverImage", coverFile);
  return axios.patch(`${USER_BASE_URL}/cover-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserChannelProfile = (token, userName) =>
  axios.get(`${USER_BASE_URL}/c/${userName}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getWatchHistory = (token) =>
  axios.get(`${USER_BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const addToWatchHistory = async (token, videoId) => {
  try {
    const response = await axios.post(
      `${USER_BASE_URL}/history/${videoId}`,
      {
        videoId: videoId, // Send videoId in request body instead
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error adding to watch history:", error);
    throw error;
  }
};
export const removeFromWatchHistory = (videoId, token) =>
  axios.delete(`${USER_BASE_URL}/history/${videoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const clearWatchHistory = (token) =>
  axios.delete(`${USER_BASE_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const searchUsers = (token, query) =>
  axios.get(`${USER_BASE_URL}/search?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
// admin
export const adminLogin = (data) => axios.post(`${ADMIN_BASE_URL}/login`, data);
//register a new admin (superadmin only )
export const adminRegister = (token, data) =>
  axios.post(`${ADMIN_BASE_URL}/register`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Get all admins (Super Admin only)
export const getAllAdmins = (token, params = {}) => {
  const queryParams = new URLSearchParams();

  // Add optional query parameters
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.status && params.status !== "all")
    queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = `${ADMIN_BASE_URL}/list${queryString ? `?${queryString}` : ""}`;

  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const adminDeleteAdmin = (token, adminId, { confirmDelete, reason }) => {
  const deletePayload = {
    confirmDelete,
    ...(reason && { reason }), // Only include reason if provided
  };

  return axios.delete(`${ADMIN_BASE_URL}/${adminId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: deletePayload,
  });
};
// Get admin by ID (Super Admin only)
export const getAdminById = (token, adminId) =>
  axios.get(`${ADMIN_BASE_URL}/profile/${adminId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getAllUsers = (token, params = {}) => {
  const queryParams = new URLSearchParams();

  // Add optional query parameters
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = `${ADMIN_BASE_URL}/users/list${
    queryString ? `?${queryString}` : ""
  }`;

  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserById = (token, userId) =>
  axios.get(`${ADMIN_BASE_URL}/users/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
// Toggle admin status (Super Admin only)
export const toggleAdminStatus = (token, adminId, statusData = {}) =>
  axios.patch(`${ADMIN_BASE_URL}/${adminId}/toggle-status`, statusData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
export const getCurrentAdmin = (token) => {
  return axios.get(`${ADMIN_BASE_URL}/current-admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const adminLogout = (token) =>
  axios.post(
    `${ADMIN_BASE_URL}/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true, // Important for cookies
    }
  );
// Admin Dashboard & Analytics
export const getAdminDashboard = (token) =>
  axios.get(`${ADMIN_BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getSystemAnalytics = (token, period = "7d") =>
  axios.get(`${ADMIN_BASE_URL}/analytics?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// User Management

export const forceDeactivateUser = (token, userId, data) =>
  axios.patch(`${ADMIN_BASE_URL}/users/${userId}/deactivate`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const adminReactivateUser = (token, userId) =>
  axios.patch(
    `${ADMIN_BASE_URL}/users/${userId}/reactivate`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const adminDeleteUser = (token, userId, data) =>
  axios.delete(`${ADMIN_BASE_URL}/users/${userId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: data, // Contains confirmDelete and reason only super admin can delete users
  });

//admin setting
// Admin Settings Management
export const getSettings = (token) =>
  axios.get(`${ADMIN_BASE_URL}/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getPublicSettings = async () => {
  try {
    const response = await axios.get(`${ADMIN_BASE_URL}/settings/public`);
    return response;
  } catch (error) {
    console.error("Error fetching public settings:", error);
    throw error;
  }
};
export const updateSettings = (token, settingsData) =>
  axios.patch(`${ADMIN_BASE_URL}/settings/update`, settingsData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const updateSpecificSetting = (token, settingData) =>
  axios.patch(`${ADMIN_BASE_URL}/settings/update-specific`, settingData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const resetSettings = (token) =>
  axios.patch(
    `${ADMIN_BASE_URL}/settings/reset`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const regenerateApiKey = (token) =>
  axios.patch(
    `${ADMIN_BASE_URL}/settings/api-key/regenerate`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// Backup Management
export const createManualBackup = (token, backupData = {}) =>
  axios.post(`${ADMIN_BASE_URL}/settings/backup/create`, backupData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const getBackupHistory = (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `${ADMIN_BASE_URL}/settings/backup/history?${queryString}`
    : `${ADMIN_BASE_URL}/settings/backup/history`;

  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Email Testing
export const testEmailNotification = (token, emailData) =>
  axios.post(`${ADMIN_BASE_URL}/settings/test-email`, emailData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
// VideoRequest
export const publishVideo = (token, videoFormData) =>
  axios.post(`${VIDEO_BASE_URL}`, videoFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
export const getChannelVideo = (token) =>
  axios.get(`${VIDEO_BASE_URL}/channel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getUserChannelVideos = (token, userId) =>
  axios.get(`${VIDEO_BASE_URL}/channel/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllVideos = (token, params = {}) => {
  const queryParams = new URLSearchParams();

  // Add optional query parameters
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.query) queryParams.append("query", params.query);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortType) queryParams.append("sortType", params.sortType);
  if (params.userId) queryParams.append("userId", params.userId);

  const queryString = queryParams.toString();
  const url = queryString ? `${VIDEO_BASE_URL}?${queryString}` : VIDEO_BASE_URL;

  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const getVideoById = (token, videoId) =>
  axios.get(`${VIDEO_BASE_URL}/${videoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateVideo = (token, videoId, data) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

  return axios.patch(`${VIDEO_BASE_URL}/${videoId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteVideo = (token, videoId) =>
  axios.delete(`${VIDEO_BASE_URL}/${videoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const togglePublishStatus = (token, videoId) =>
  axios.patch(
    `${VIDEO_BASE_URL}/toggle/publish/${videoId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
export const getVideoAnalytics = (token, videoId, days = 30) => {
  const queryParams = new URLSearchParams();
  if (days) queryParams.append("days", days);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${VIDEO_BASE_URL}/analytics/${videoId}?${queryString}`
    : `${VIDEO_BASE_URL}/analytics/${videoId}`;

  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const updateWatchDuration = (token, videoId, duration) =>
  axios.patch(
    `${VIDEO_BASE_URL}/watch-duration/${videoId}`,
    { duration },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
// ========== COMMENT REQUESTS ==========
export const getComments = (token, videoId) =>
  axios.get(`${COMMENT_BASE_URL}/${videoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addComment = (token, videoId, data) =>
  axios.post(`${COMMENT_BASE_URL}/${videoId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateComment = (token, commentId, data) =>
  axios.patch(`${COMMENT_BASE_URL}/c/${commentId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteComment = (token, commentId) =>
  axios.delete(`${COMMENT_BASE_URL}/c/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// dashboaord

export const getChannelStats = (token) =>
  axios.get(`${DASHBOARD_BASE_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getChannelVideos = (token) =>
  axios.get(`${DASHBOARD_BASE_URL}/videos`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// playlist
export const createPlaylist = (token, data) =>
  axios.post(`${PLAYLIST_BASE_URL}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getPlaylistById = (token, playlistId) =>
  axios.get(`${PLAYLIST_BASE_URL}/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updatePlaylist = (token, playlistId, data) =>
  axios.patch(`${PLAYLIST_BASE_URL}/${playlistId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deletePlaylist = (token, playlistId) =>
  axios.delete(`${PLAYLIST_BASE_URL}/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addVideoToPlaylist = (token, videoId, playlistId) =>
  axios.post(`${PLAYLIST_BASE_URL}/add/${videoId}/${playlistId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const removeVideoFromPlaylist = (token, videoId, playlistId) =>
  axios.patch(`${PLAYLIST_BASE_URL}/remove/${videoId}/${playlistId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getUserPlaylists = (token, userId) =>
  axios.get(`${PLAYLIST_BASE_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
// like
export const toggleVideoLike = (token, videoId) =>
  axios.post(`${LIKE_BASE_URL}/toggle/v/${videoId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const toggleCommentLike = (token, commentId) =>
  axios.post(`${LIKE_BASE_URL}/toggle/c/${commentId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const toggleTweetLike = (token, tweetId) =>
  axios.post(`${LIKE_BASE_URL}/toggle/t/${tweetId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getLikedVideos = (token) =>
  axios.get(`${LIKE_BASE_URL}/videos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getVideoWithLikeStatus = (token, videoId) =>
  axios.get(`${LIKE_BASE_URL}/videos/${videoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
//subscriber
export const toggleSubscription = (token, channelId) =>
  axios.post(`${SUBSCRIPTION_BASE_URL}/c/${channelId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getUserChannelSubscriber = (token, channelId) =>
  axios.get(`${SUBSCRIPTION_BASE_URL}/c/${channelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getSubscribedChannels = (
  token,
  subscriberId,
  page = 1,
  limit = 100
) =>
  axios.get(
    `${SUBSCRIPTION_BASE_URL}/u/${subscriberId}?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
export const getTotalSubscribers = (token, channelId) =>
  axios.get(`${SUBSCRIPTION_BASE_URL}/count/${channelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const isUserSubscribed = (token, channelId) =>
  axios.get(`${SUBSCRIPTION_BASE_URL}/check/${channelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getSubscribedChannelNotifications = (
  token,
  page = 1,
  limit = 20,
  hoursBack = 168,
  onlyUnwatched = false
) =>
  axios.get(
    `${SUBSCRIPTION_BASE_URL}/notifications?page=${page}&limit=${limit}&hoursBack=${hoursBack}&onlyUnwatched=${onlyUnwatched}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
export const getRecentNotifications = (token, hoursBack = 24) =>
  axios.get(
    `${SUBSCRIPTION_BASE_URL}/notifications?page=1&limit=50&hoursBack=${hoursBack}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// Function to get notifications summary only (without full video details)
export const getNotificationsSummary = (token, hoursBack = 168) =>
  axios
    .get(
      `${SUBSCRIPTION_BASE_URL}/notifications?page=1&limit=1&hoursBack=${hoursBack}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((response) => ({
      summary: response.data.data.summary,
      totalNotifications: response.data.data.pagination.totalNotifications,
    }));
export const getHealthStatus = () => axios.get(`${HEALTHCHECK_BASE_URL}`);
