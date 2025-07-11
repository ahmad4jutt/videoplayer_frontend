import axios from "axios";
//USER routes

const USER_BASE_URL = "http://localhost:8000/api/v1/users";
const VIDEO_BASE_URL = "http://localhost:8000/api/v1/videos/";
const COMMENT_BASE_URL = "http://localhost:8000/api/v1/comments";
const DASHBOARD_BASE_URL = "http://localhost:8000/api/v1/dashboard";
const PLAYLIST_BASE_URL = "http://localhost:8000/api/v1/playlists";
const LIKE_BASE_URL = "http://localhost:8000/api/v1/likes";
const SUBSCRIPTION_BASE_URL = "http://localhost:8000/api/v1/subscriptions";
const HEALTHCHECK_BASE_URL = "http://localhost:8000/api/v1/healthcheck";

export const registerUser = (formData) =>
  axios.post(`${USER_BASE_URL}/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const loginUser = (data) => axios.post(`${USER_BASE_URL}/login`, data);

export const logoutUser = (token) =>
  axios.post(
    `${USER_BASE_URL}/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
export const forgotPassword = (email) => {
  axios.post(`${USER_BASE_URL}/forget-password`, { email });
};
export const resetPassword = (token, password) => {
  return axios.post(`${USER_BASE_URL}/reset-password/${token}`, {
    password: password,
    confirmPassword: password,
  });
};
export const getcurrentUser = (token) =>
  axios.post(
    `${USER_BASE_URL}/current-user`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

export const changePassword = (token, data) =>
  axios.post(`${USER_BASE_URL}/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAccountDetails = (token, data) =>
  axios.post(`${USER_BASE_URL}/update-account`, data, {
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
export const getAllVideos = (token, videoId) =>
  axios.get(`${VIDEO_BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export const getHealthStatus = () => axios.get(`${HEALTHCHECK_BASE_URL}`);
