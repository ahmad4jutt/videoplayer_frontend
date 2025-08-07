import React, { useState, useEffect } from "react";
import { Heart, Play, User, Eye, Calendar, Clock } from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { getLikedVideos } from "../../services/api";
import { Link } from "react-router-dom";

const LikedVideo = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getLikedVideos(token);

      // Fix: Access the correct nested data structure
      if (response.data?.data?.videos) {
        const videos = response.data.data.videos;

        // Ensure we have an array
        if (Array.isArray(videos)) {
          setLikedVideos(videos);
          setPagination(response.data.data.pagination);
        } else {
          setLikedVideos([]);
          console.warn("API response videos is not an array:", videos);
        }
      } else {
        setLikedVideos([]);
        setError("Invalid response format");
      }
    } catch (err) {
      setError("Failed to fetch liked videos");
      console.error("Error fetching liked videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (videoId) => {
    try {
      // Optimistically remove from UI
      setLikedVideos((prevVideos) =>
        prevVideos.filter((video) => video._id !== videoId)
      );

      // Here you would call your unlike API
      // await unlikeVideo(token, videoId);
    } catch (err) {
      // Revert optimistic update on error
      fetchLikedVideos();
      console.error("Error unliking video:", err);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div
        className={`max-w-7xl mx-auto p-6 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        } min-h-screen`}
      >
        <div className="mb-8">
          <div
            className={`h-8 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            } rounded w-48 mb-2 animate-pulse`}
          ></div>
          <div
            className={`h-4 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            } rounded w-32 animate-pulse`}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div
                className={`${
                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                } rounded-lg h-48 mb-3`}
              ></div>
              <div
                className={`h-4 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                } rounded mb-2`}
              ></div>
              <div
                className={`h-3 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                } rounded w-3/4 mb-2`}
              ></div>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-6 w-6 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } rounded-full`}
                ></div>
                <div
                  className={`h-3 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } rounded w-20`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`max-w-7xl mx-auto p-6 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        } min-h-screen`}
      >
        <div
          className={`${
            isDarkMode
              ? "bg-red-900/20 border-red-800"
              : "bg-red-50 border-red-200"
          } border rounded-lg p-6`}
        >
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3
                className={`${
                  isDarkMode ? "text-red-400" : "text-red-800"
                } font-semibold`}
              >
                Error
              </h3>
              <p className={`${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={fetchLikedVideos}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-7xl mx-auto p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      } min-h-screen transition-colors duration-200`}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Heart className="w-8 h-8 text-red-600 fill-current" />
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Liked Videos
          </h1>
        </div>
        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          {likedVideos.length} {likedVideos.length === 1 ? "video" : "videos"}{" "}
          you've liked
        </p>
      </div>

      {/* Empty State */}
      {likedVideos.length === 0 && (
        <div className="text-center py-16">
          <Heart
            className={`w-16 h-16 ${
              isDarkMode ? "text-gray-600" : "text-gray-300"
            } mx-auto mb-4`}
          />
          <h3
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            No liked videos yet
          </h3>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Videos you like will appear here
          </p>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {likedVideos.map((video) => (
          <div
            key={video._id}
            className={`${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-750 shadow-lg hover:shadow-xl"
                : "bg-white hover:shadow-md shadow-sm"
            } rounded-xl transition-all duration-200`}
          >
            {/* Thumbnail */}
            <Link to={`/video/${video._id}`}>
              <div className="relative group cursor-pointer">
                <img
                  src={video.thumbnail?.url || video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-t-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {formatDuration(video.duration)}
                </div>
                {/* Unlike button */}
                <button
                  onClick={() => handleUnlike(video._id)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Unlike video"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
            </Link>
            {/* Video Info */}
            <div className="p-4">
              <h3
                className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } line-clamp-2 mb-2 leading-snug`}
              >
                {video.title}
              </h3>

              {/* Channel Info */}
              <div className="flex items-center space-x-2 mb-2">
                <img
                  src={video.owner.avatar}
                  alt={video.owner.fullName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {video.owner.fullName}
                </span>
              </div>

              {/* Stats */}
              <div
                className={`flex items-center space-x-4 text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViews(video.views)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{video.likesCount || 0}</span>
                </div>
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Info (optional) */}
      {pagination && (
        <div
          className={`mt-8 text-center text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Page {pagination.currentPage} of {pagination.totalPages} (
          {pagination.totalVideos} total videos)
        </div>
      )}
    </div>
  );
};

export default LikedVideo;
