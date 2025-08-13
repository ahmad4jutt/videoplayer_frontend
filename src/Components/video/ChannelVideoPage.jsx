import React, { useState, useEffect } from "react";
import {
  Play,
  Eye,
  Calendar,
  Clock,
  Users,
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getChannelVideo } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

const ChannelVideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);

  const { token } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchChannelVideos();
  }, []);

  const fetchChannelVideos = async () => {
    try {
      setLoading(true);
      const response = await getChannelVideo(token);

      if (response.data.success) {
        setVideos(response.data.data);
      } else {
        setError("Failed to fetch videos");
      }
    } catch (err) {
      setError("Error fetching videos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M";
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K";
    }
    return views.toString();
  };
  const handleShare = async (video = null, type = "video") => {
    try {
      const shareData = {
        video: {
          title: video.title,
          text: `Check out this video: ${video.title}`,
          url: `${window.location.origin}/video/${video._id}`,
        },
        channel: {
          title: `${videos[0]?.owner.fullName}'s Channel`,
          text: `Check out ${videos[0]?.owner.fullName}'s channel with ${videos.length} videos!`,
          url: window.location.href,
        },
      };

      const data = shareData[type];

      if (navigator.share && navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);

        toast.success(`Link copied to clipboard!`);
      }
    } catch (error) {
      toast.error("Error sharing:", error);
      // Fallback: just copy the URL
      try {
        const url =
          type === "video"
            ? `${window.location.origin}/video/${video._id}`
            : window.location.href;
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
      }
    }
  };

  const handleVideoClick = (video) => {
    // Handle video click - could navigate to video page or perform other actions
    console.log("Video clicked:", video);
  };

  const totalViews = videos.reduce((total, video) => total + video.views, 0);

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        } flex items-center justify-center px-4`}
      >
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
          <h3
            className={`text-lg sm:text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            Loading your content
          </h3>
          <p
            className={`${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            } text-sm sm:text-base`}
          >
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        } flex items-center justify-center px-4`}
      >
        <div
          className={`text-center p-6 sm:p-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg max-w-md mx-auto shadow-lg w-full`}
        >
          <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
          <h3
            className={`text-lg sm:text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Something went wrong
          </h3>
          <p
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } mb-6 text-sm sm:text-base`}
          >
            {error}
          </p>
          <button
            onClick={fetchChannelVideos}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header with User Details */}
      <div className="relative">
        {/* Cover Image - Only show if it exists */}
        {videos.length > 0 && videos[0].owner.coverImage && (
          <div className="h-48 sm:h-64 md:h-80 lg:h-96 relative overflow-hidden">
            <img
              src={videos[0].owner.coverImage}
              alt="Channel Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>
        )}

        {/* User Profile Section - Always show if videos exist */}
        {videos.length > 0 && (
          <div
            className={`relative ${
              videos[0].owner.coverImage ? "-mt-12 sm:-mt-16" : "mt-0"
            } z-10`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {/* User Info - Top Row */}
              <div
                className={`flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 ${
                  videos[0].owner.coverImage
                    ? "text-white"
                    : isDarkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={videos[0].owner.avatar}
                    alt={videos[0].owner.fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white"></div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h1
                    className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 ${
                      isDarkMode
                        ? "text-white bg-none"
                        : "text-white rounded-sm bg-gray-500 w-[50%]"
                    } truncate`}
                  >
                    {videos[0].owner.fullName}
                  </h1>
                  <p
                    className={`${
                      videos[0].owner.coverImage
                        ? "text-gray-200"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-600 "
                    } text-sm sm:text-base`}
                  >
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {" "}
                      {videos.length} {videos.length === 1 ? "video" : "videos"}{" "}
                      • {formatViews(totalViews)} total views
                    </p>
                  </p>
                </div>
              </div>

              {/* Stats Grid - Separate row */}
              <div className="mb-8 sm:mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <div
                    className={`p-3 sm:p-4 ${
                      videos[0].owner.coverImage
                        ? "bg-black/40 border-white/10"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } backdrop-blur-sm rounded-xl border`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      </div>
                      <div>
                        <div
                          className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                            videos[0].owner.coverImage
                              ? "text-white"
                              : isDarkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {totalViews.toLocaleString()}
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${
                            videos[0].owner.coverImage
                              ? "text-gray-300"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Total Views
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 sm:p-4 ${
                      videos[0].owner.coverImage
                        ? "bg-black/40 border-white/10"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } backdrop-blur-sm rounded-xl border`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      </div>
                      <div>
                        <div
                          className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                            videos[0].owner.coverImage
                              ? "text-white"
                              : isDarkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {videos.length}
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${
                            videos[0].owner.coverImage
                              ? "text-gray-300"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {videos.length === 1 ? "Video" : "Videos"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 sm:p-4 sm:col-span-2 lg:col-span-1 ${
                      videos[0].owner.coverImage
                        ? "bg-black/40 border-white/10"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } backdrop-blur-sm rounded-xl border`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-600/20 rounded-lg">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      </div>
                      <div>
                        <div
                          className={`text-sm sm:text-base lg:text-lg font-bold ${
                            videos[0].owner.coverImage
                              ? "text-white"
                              : isDarkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {formatDate(
                            videos[0].owner.createdAt || videos[0].createdAt
                          )}
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${
                            videos[0].owner.coverImage
                              ? "text-gray-300"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Joined
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Header */}
              <div
                className={`border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-300"
                } pt-6 sm:pt-8 mb-6 sm:mb-8`}
              >
                <h2
                  className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } mb-2 flex items-center justify-center sm:justify-start`}
                >
                  Latest Videos
                  <ChevronRight
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } ml-2`}
                  />
                </h2>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } text-center sm:text-left text-sm sm:text-base`}
                >
                  {videos.length} {videos.length === 1 ? "video" : "videos"}{" "}
                  available
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        {videos.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div
              className={`${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              } text-6xl sm:text-8xl mb-6 sm:mb-8`}
            >
              📹
            </div>
            <h3
              className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              No videos yet
            </h3>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } text-base sm:text-lg px-4`}
            >
              This channel hasn't uploaded any content yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="group "
                onClick={() => handleVideoClick(video)}
                onMouseEnter={() => setHoveredVideo(video._id)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  } rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl shadow-md`}
                >
                  {/* Thumbnail */}
                  <Link to={`/video/${video._id}`}>
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={video.thumbnail.url}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`transform transition-all duration-300 ${
                            hoveredVideo === video._id
                              ? "scale-100 opacity-100"
                              : "scale-90 opacity-0"
                          }`}
                        >
                          <div className="p-4 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-white/20">
                            <Play className="w-6 h-6 text-gray-800 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Duration badge */}
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
                        {formatDuration(video.duration)}
                      </div>

                      {/* View count badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatViews(video.views)}
                      </div>
                    </div>
                  </Link>
                  {/* Video Info */}
                  <div className="p-5">
                    {/* Owner Info */}
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <img
                          src={video.owner.avatar}
                          alt={video.owner.fullName}
                          className={`w-8 h-8 object-cover rounded-full mr-3 border-2 ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          } text-sm font-medium truncate block`}
                        >
                          {video.owner.fullName}
                        </span>
                      </div>
                    </div>
                    {/* Title */}
                    <h3
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } mb-3 line-clamp-2 text-base leading-snug group-hover:text-blue-600 transition-colors duration-200`}
                    >
                      {video.title}
                    </h3>

                    {/* Stats and Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Eye
                            className={`w-4 h-4 mr-1.5 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            } font-medium`}
                          >
                            {formatViews(video.views)}
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center">
                          <Calendar
                            className={`w-4 h-4 mr-1.5 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            } font-medium`}
                          >
                            {formatDate(video.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent Link navigation
                            e.stopPropagation(); // Prevent card click
                            handleShare(video, "video");
                          }}
                          className={`p-2 ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-gray-400 hover:text-blue-400"
                              : "hover:bg-gray-50 text-gray-500 hover:text-blue-600"
                          } rounded-lg transition-all duration-200 hover:scale-105`}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelVideoPage;
