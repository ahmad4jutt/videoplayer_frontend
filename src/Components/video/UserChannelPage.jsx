import React, { useState, useEffect } from "react";
import {
  Play,
  Calendar,
  Eye,
  Users,
  Settings,
  Bell,
  Share2,
  Video,
  Zap,
  Bookmark,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {
  getUserChannelVideos,
  isUserSubscribed,
  toggleSubscription,
  getUserPlaylists,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

const UserChannelPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [limit, setLimit] = useState(12);
  const [activeSection, setActiveSection] = useState("videos");

  // Subscription states
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { userId } = useParams();
  const { token } = useAuth();
  //playlist
  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

  useEffect(() => {
    fetchChannelData();
    checkSubscriptionStatus();
    fetchUserPlaylists();
  }, [currentPage, sortBy, sortType, limit]);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const response = await getUserChannelVideos(token, userId, {
        page: currentPage,
        limit,
        sortBy,
        sortType,
      });
      setChannelData(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch channel data");
      console.error("Error fetching channel data:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserPlaylists = async () => {
    try {
      setPlaylistsLoading(true);
      const response = await getUserPlaylists(token, userId);

      const publicPlaylists = response.data.data.filter(
        (playlist) => playlist.isPublic || subscriptionData?.isOwnChannel
      );
      setPlaylists(publicPlaylists);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    } finally {
      setPlaylistsLoading(false);
    }
  };
  const checkSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await isUserSubscribed(token, userId);
      setSubscriptionData(response.data.data);
    } catch (err) {
      console.error("Error checking subscription status:", err);
      setPlaylists([]);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscription = async () => {
    if (subscriptionData?.isOwnChannel) return;

    try {
      setIsSubscribing(true);
      const response = await toggleSubscription(token, userId);

      // Update subscription status locally
      setSubscriptionData((prev) => ({
        ...prev,
        isSubscribed: response.data.data.subscribed,
      }));

      // Optionally refetch channel data to update subscriber count
      fetchChannelData();
    } catch (err) {
      console.error("Error toggling subscription:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || "0";
  };

  const formatSubscribers = (subscribers) => {
    if (subscribers >= 1000000) {
      return `${(subscribers / 1000000).toFixed(1)}M`;
    } else if (subscribers >= 1000) {
      return `${(subscribers / 1000).toFixed(1)}K`;
    }
    return subscribers?.toString() || "0";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter videos by duration (shorts vs videos)
  const filterVideosBySection = (videos) => {
    if (activeSection === "shorts") {
      return videos.filter((video) => video.duration <= 60);
    } else {
      return videos.filter((video) => video.duration > 60);
    }
  };
  const handleShare = async () => {
    const shareData = {
      title: `${channelInfo.fullName} - Channel`,
      text: `Check out ${
        channelInfo.fullName
      }'s channel with ${formatSubscribers(
        channelInfo.totalSubscribers
      )} subscribers!`,
      url: window.location.href,
    };

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          // Fallback to custom share menu
          setShowShareMenu(true);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      setShowShareMenu(true);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You might want to show a toast notification here
      toast.success("Link copied to clipboard!");
      setShowShareMenu(false);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Share to social media functions
  const shareToSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Check out ${channelInfo.fullName}'s channel!`
    );

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };
  const VideoCard = ({ video }) => (
    <div>
      <div
        className={`group ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border ${
          isDarkMode
            ? "border-gray-700 hover:border-gray-600"
            : "border-gray-100 hover:border-gray-200"
        } transform hover:-translate-y-1`}
      >
        <div className="relative overflow-hidden">
          <img
            src={video.thumbnail.url}
            alt={video.title}
            className="w-full h-38 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="text-white" size={32} fill="white" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-sm font-medium">
              {formatDuration(video.duration)}
            </span>
          </div>
          {video.duration <= 60 && (
            <div className="absolute top-3 left-3">
              <div className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center">
                <Zap size={12} className="mr-1" />
                SHORT
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="">
        <h3
          className={`font-bold ${
            isDarkMode
              ? "text-white group-hover:text-blue-400"
              : "text-gray-900 group-hover:text-blue-600"
          } text-lg  line-clamp-2 transition-colors duration-300`}
        >
          {video.title}
        </h3>

        <div className="flex items-center justify-between text-sm">
          <div
            className={`flex items-center space-x-4 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <div
              className={`flex items-center ${
                isDarkMode ? "bg-transparent" : "bg-gray-50"
              }  py-1 `}
            >
              <span className="font-medium">
                {formatViews(video.views)} views
              </span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const PlaylistCard = ({ playlist }) => (
    <div>
      <div
        className={`group ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border ${
          isDarkMode
            ? "border-gray-700 hover:border-gray-600"
            : "border-gray-100 hover:border-gray-200"
        } transform hover:-translate-y-1`}
      >
        <div className="relative overflow-hidden">
          {playlist.videos.length > 0 ? (
            <div className="relative">
              <img
                src={playlist.videos[0].thumbnail.url}
                alt={playlist.name}
                className="w-full h-38 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 right-3">
                <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center">
                  <Bookmark size={14} className="mr-1.5" />
                  {playlist.videos.length} videos
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <Play className="text-white" size={32} fill="white" />
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-52 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              } flex items-center justify-center`}
            >
              <div className="text-center">
                <Bookmark
                  size={48}
                  className={
                    isDarkMode ? "text-gray-500 mb-2" : "text-gray-400 mb-2"
                  }
                />
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No videos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="">
        <h3
          className={`font-bold ${
            isDarkMode
              ? "text-white group-hover:text-blue-400"
              : "text-gray-900 group-hover:text-blue-600"
          } text-lg  line-clamp-2 transition-colors duration-300`}
        >
          {playlist.name}
        </h3>
        {playlist.description && (
          <p
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } text-sm mb-4 line-clamp-2 leading-relaxed`}
          >
            View full playlist
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <div
            className={`flex items-center space-x-4 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
  const VideoListItem = ({ video }) => (
    <div
      className={`group ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border ${
        isDarkMode
          ? "border-gray-700 hover:border-gray-600"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="flex">
        <div className="relative w-72 h-40 flex-shrink-0 overflow-hidden">
          <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-sm font-medium">
              {formatDuration(video.duration)}
            </span>
          </div>
          {video.duration <= 60 && (
            <div className="absolute top-3 left-3">
              <div className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center">
                <Zap size={12} className="mr-1" />
                SHORT
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 p-6">
          <h3
            className={`font-bold ${
              isDarkMode
                ? "text-white group-hover:text-blue-400"
                : "text-gray-900 group-hover:text-blue-600"
            } text-xl mb-3 cursor-pointer transition-colors duration-300`}
          >
            {video.title}
          </h3>
          <p
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } text-sm mb-4 line-clamp-3 leading-relaxed`}
          >
            {video.description}
          </p>
          <div
            className={`flex items-center space-x-6 text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <div
              className={`flex items-center ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              } px-3 py-1.5 rounded-full`}
            >
              <Eye size={14} className="mr-1.5" />
              <span className="font-medium">
                {formatViews(video.views)} views
              </span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-white"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="relative">
            <div
              className={`animate-spin rounded-full h-16 w-16 border-4 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              } mx-auto`}
            ></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p
            className={`mt-6 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } font-medium`}
          >
            Loading channel content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-white"
        } flex items-center justify-center`}
      >
        <div
          className={`text-center ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } p-8 rounded-2xl shadow-lg`}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button
            onClick={fetchChannelData}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-white"
        } flex items-center justify-center`}
      >
        <p
          className={`${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          } font-medium`}
        >
          No channel data available
        </p>
      </div>
    );
  }

  const { channelInfo, videos, pagination } = channelData;
  const filteredVideos = filterVideosBySection(videos);
  const videosCount = videos.filter((video) => video.duration > 60).length;
  const shortsCount = videos.filter((video) => video.duration <= 60).length;

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-gray-50 to-white"
      }`}
    >
      {/* Enhanced Channel Header */}
      <div className="relative">
        {/* Cover Image with Overlay */}
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={channelInfo.coverImage}
            alt={`${channelInfo.fullName} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Channel Info Card */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              } rounded-3xl shadow-2xl border p-8 -mt-24 relative z-10`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="relative">
                  <img
                    src={channelInfo.avatar}
                    alt={channelInfo.fullName}
                    className="w-28 h-28 lg:w-36 lg:h-36 object-cover rounded-full border-4 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-1 right-1  w-6 h-6  bg-green-500 border-4 border-transparent rounded-full"></div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                      <h1
                        className={`text-3xl lg:text-4xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        } mb-2`}
                      >
                        {channelInfo.fullName}
                      </h1>
                      <p className="text-blue-600 font-medium text-lg mb-4">
                        @{channelInfo.username}
                      </p>

                      <div
                        className={`flex items-center space-x-6 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <div
                          className={`flex items-center ${
                            isDarkMode
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-blue-50"
                          } px-4 py-2 rounded-full`}
                        >
                          <Users
                            size={18}
                            className={`mr-2 ${
                              isDarkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                          <span
                            className={`font-bold ${
                              isDarkMode ? "text-blue-300" : "text-blue-800"
                            }`}
                          >
                            {formatSubscribers(channelInfo.totalSubscribers)}
                          </span>
                          <span className="ml-1 text-sm">subscribers</span>
                        </div>
                        <div
                          className={`flex items-center ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-50"
                          } px-4 py-2 rounded-full`}
                        >
                          <Play
                            size={18}
                            className={`mr-2 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`font-bold ${
                              isDarkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {pagination.total}
                          </span>
                          <span className="ml-1 text-sm">videos</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Subscription Button */}
                      {subscriptionLoading ? (
                        <div className="px-6 py-3 rounded-xl bg-gray-100 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                          <span className="text-gray-600">Loading...</span>
                        </div>
                      ) : subscriptionData?.isOwnChannel ? (
                        <button
                          className={`${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          } px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center shadow-lg hover:shadow-xl`}
                        >
                          <Settings size={18} className="mr-2" />
                          <Link to="/channel">Manage Channel</Link>
                        </button>
                      ) : subscriptionData ? (
                        <button
                          onClick={handleSubscription}
                          disabled={isSubscribing}
                          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center transform hover:scale-105 ${
                            subscriptionData.isSubscribed
                              ? `${
                                  isDarkMode
                                    ? "bg-gray-600 hover:bg-gray-700 text-white border border-gray-500"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300"
                                }`
                              : "bg-red-600 hover:bg-red-700 text-white border border-red-600"
                          } ${
                            isSubscribing
                              ? "opacity-50 cursor-not-allowed scale-100"
                              : ""
                          }`}
                        >
                          {isSubscribing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Processing...
                            </>
                          ) : subscriptionData.isSubscribed ? (
                            <>
                              <Bell size={18} className="mr-2 fill-current" />
                              Subscribed
                            </>
                          ) : (
                            <>
                              <Bell size={18} className="mr-2" />
                              Subscribe
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className={`px-6 py-3 rounded-xl font-medium flex items-center ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-500"
                              : "bg-gray-100 text-gray-400"
                          } cursor-not-allowed`}
                        >
                          <Bell size={18} className="mr-2" />
                          Subscribe
                        </button>
                      )}

                      <div className="relative">
                        <button
                          onClick={handleShare}
                          className={`${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          } p-3 rounded-xl transition-colors duration-300 shadow-lg hover:shadow-xl`}
                        >
                          <Share2 size={18} />
                        </button>

                        {/* Custom Share Menu */}
                        {showShareMenu && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setShowShareMenu(false)}
                            />

                            {/* Share Menu */}
                            <div
                              className={`absolute right-0 top-full mt-2 w-64 ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-700"
                                  : "bg-white border-gray-200"
                              } border rounded-xl shadow-xl z-50 p-4`}
                            >
                              <h3
                                className={`font-semibold mb-3 ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                Share Channel
                              </h3>

                              {/* Copy Link */}
                              <button
                                onClick={() =>
                                  copyToClipboard(window.location.href)
                                }
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-gray-700 text-gray-300"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                  </svg>
                                </div>
                                <span>Copy Link</span>
                              </button>

                              {/* Social Media Options */}
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <button
                                  onClick={() => shareToSocial("twitter")}
                                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                    isDarkMode
                                      ? "hover:bg-gray-700 text-gray-300"
                                      : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      T
                                    </span>
                                  </div>
                                  <span className="text-sm">Twitter</span>
                                </button>

                                <button
                                  onClick={() => shareToSocial("facebook")}
                                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                    isDarkMode
                                      ? "hover:bg-gray-700 text-gray-300"
                                      : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      f
                                    </span>
                                  </div>
                                  <span className="text-sm">Facebook</span>
                                </button>

                                <button
                                  onClick={() => shareToSocial("whatsapp")}
                                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                    isDarkMode
                                      ? "hover:bg-gray-700 text-gray-300"
                                      : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      W
                                    </span>
                                  </div>
                                  <span className="text-sm">WhatsApp</span>
                                </button>

                                <button
                                  onClick={() => shareToSocial("telegram")}
                                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                                    isDarkMode
                                      ? "hover:bg-gray-700 text-gray-300"
                                      : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      T
                                    </span>
                                  </div>
                                  <span className="text-sm">Telegram</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Tabs */}
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          } rounded-2xl shadow-sm border p-3 sm:p-6 mb-8`}
        >
          <div className="flex items-center space-x-2 sm:space-x-8 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div
              onClick={() => setActiveSection("videos")}
              className={`relative flex items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer font-medium transition-all duration-300 group whitespace-nowrap ${
                activeSection === "videos"
                  ? "text-blue-600 dark:text-blue-400"
                  : `${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                    }`
              }`}
            >
              <Video
                size={16}
                className="sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-sm sm:text-lg">Videos</span>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  activeSection === "videos"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 scale-105"
                    : `${
                        isDarkMode
                          ? "bg-gray-800 text-gray-100 group-hover:bg-gray-700 group-hover:text-gray-300"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                      }`
                }`}
              >
                {videosCount}
              </span>
              {/* Animated bottom border */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ${
                  activeSection === "videos"
                    ? "w-full opacity-100"
                    : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                }`}
              />
            </div>

            <div
              onClick={() => setActiveSection("shorts")}
              className={`relative flex items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer font-medium transition-all duration-300 group whitespace-nowrap ${
                activeSection === "shorts"
                  ? "text-red-600 dark:text-red-400"
                  : `${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                    }`
              }`}
            >
              <Zap
                size={16}
                className="sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-sm sm:text-lg">Shorts</span>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  activeSection === "shorts"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 scale-105"
                    : `${
                        isDarkMode
                          ? "bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-300"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                      }`
                }`}
              >
                {shortsCount}
              </span>
              {/* Animated bottom border */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ${
                  activeSection === "shorts"
                    ? "w-full opacity-100"
                    : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                }`}
              />
            </div>

            <div
              onClick={() => setActiveSection("playlists")}
              className={`relative flex items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer font-medium transition-all duration-300 group whitespace-nowrap ${
                activeSection === "playlists"
                  ? "text-purple-600 dark:text-purple-400"
                  : `${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                    }`
              }`}
            >
              <Bookmark
                size={16}
                className="sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-sm sm:text-lg">Playlists</span>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  activeSection === "playlists"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 scale-105"
                    : `${
                        isDarkMode
                          ? "bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-300"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                      }`
                }`}
              >
                {playlists.length}
              </span>
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 ${
                  activeSection === "playlists"
                    ? "w-full opacity-100"
                    : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Content based on active section */}
        {activeSection === "playlists" &&
          // Playlists Section
          (playlistsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className={`${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  } rounded-2xl overflow-hidden shadow-sm animate-pulse`}
                >
                  <div
                    className={`h-52 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div className="p-5 space-y-3">
                    <div
                      className={`h-4 ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-3 ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } rounded w-2/3`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist._id}
                  onClick={() => navigate(`/playlists/${playlist._id}`)}
                  className="text-left"
                >
                  <PlaylistCard playlist={playlist} />
                </button>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-20 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              } rounded-2xl border`}
            >
              <div
                className={`w-24 h-24 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                } rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <Bookmark
                  size={32}
                  className={isDarkMode ? "text-gray-500" : "text-gray-400"}
                />
              </div>
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                No public playlists found
              </h3>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                This channel hasn't created any public playlists yet.
              </p>
            </div>
          ))}

        {/* Videos and Shorts Section */}
        {(activeSection === "videos" || activeSection === "shorts") &&
          (filteredVideos.length > 0 ? (
            <div
              className={
                viewType === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                  : "space-y-6"
              }
            >
              {filteredVideos.map((video) =>
                viewType === "grid" ? (
                  <button
                    key={video._id}
                    onClick={() => handleVideoClick(video._id)}
                    className="text-left"
                  >
                    <VideoCard video={video} />
                  </button>
                ) : (
                  <button
                    key={video._id}
                    onClick={() => handleVideoClick(video._id)}
                    className="text-left w-full"
                  >
                    <VideoListItem video={video} />
                  </button>
                )
              )}
            </div>
          ) : (
            <div
              className={`text-center py-20 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              } rounded-2xl border`}
            >
              <div
                className={`w-24 h-24 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                } rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                {activeSection === "shorts" ? (
                  <Zap
                    size={32}
                    className={isDarkMode ? "text-gray-500" : "text-gray-400"}
                  />
                ) : (
                  <Play
                    size={32}
                    className={isDarkMode ? "text-gray-500" : "text-gray-400"}
                  />
                )}
              </div>
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                No {activeSection === "shorts" ? "shorts" : "videos"} found
              </h3>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                This channel hasn't uploaded any{" "}
                {activeSection === "shorts" ? "shorts" : "videos"} yet.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UserChannelPage;
