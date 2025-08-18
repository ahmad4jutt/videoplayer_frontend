import React, { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  UserMinus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  Clock,
  Users,
  Loader2,
  VolumeX,
  Volume2,
  MoreVertical,
  Share2,
  Bookmark,
  PlayIcon,
  Link,
  VideoOff,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { useTheme } from "../context/ThemeContext";
import { getSubscribedChannels, toggleSubscription } from "../services/api";

const SubscribedChannels = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(12);
  const [toggleLoading, setToggleLoading] = useState({});
  const [openShareMenu, setOpenShareMenu] = useState(null); // Track which menu is open

  const { token, currentUser } = useAuth();

  const fetchSubscribedChannels = async (page = 1) => {
    setLoading(true);
    try {
      const currentUserId = currentUser?.id || currentUser?._id;

      if (!currentUserId) {
        console.error("User ID not available");
        setLoading(false);
        return;
      }

      const response = await getSubscribedChannels(
        token,
        currentUserId,
        page,
        limit
      );
      setSubscribedChannels(response.data.data.subscribedChannels);
      setTotalPages(response.data.data.totalPages);
      setTotalCount(response.data.data.totalSubscribedChannels);
    } catch (error) {
      console.error("Error fetching subscribed channels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels(1);
  }, [currentUser]);

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  const handleChannelClick = (channelId) => {
    navigate(`/channel/${channelId}`);
  };

  const handleVideoClick = (videoId, e) => {
    e.stopPropagation();
    navigate(`/video/${videoId}`);
  };

  const formatViewCount = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || "0";
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Unknown";
    const now = new Date();
    const videoDate = new Date(date);
    const diffTime = Math.abs(now - videoDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatDuration = (second) => {
    if (!second) return "0:00";

    const totalSeconds = Math.round(second);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredChannels = subscribedChannels.filter((channel) => {
    if (!channel.channelDetails) return false;

    const fullName = channel.channelDetails.fullName || "";
    const userName = channel.channelDetails.userName || "";
    const searchTermLower = searchTerm.toLowerCase();

    return (
      fullName.toLowerCase().includes(searchTermLower) ||
      userName.toLowerCase().includes(searchTermLower)
    );
  });

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openShareMenu && !event.target.closest(".share-menu-container")) {
        setOpenShareMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openShareMenu]);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-600 rounded-full opacity-20"></div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div
        className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <UserPlus
          size={40}
          className={isDarkMode ? "text-gray-400" : "text-gray-500"}
        />
      </div>
      <h3
        className={`text-xl font-semibold mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        No Subscribed Channels
      </h3>
      <p
        className={`text-base max-w-md mx-auto ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Start exploring and subscribe to channels to see them here. Discover
        amazing content creators!
      </p>
    </div>
  );

  const ChannelCard = ({ channel }) => {
    const recentVideo = channel.recentVideos?.[0];
    const channelId = channel.channel;
    const isToggling = toggleLoading[channelId];
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);
    const cardId = `card-${channelId}`;

    const handleMuteToggle = (e) => {
      e.stopPropagation();
      setIsMuted((prev) => {
        const newMutedState = !prev;
        if (videoRef.current) {
          videoRef.current.muted = newMutedState;
        }
        return newMutedState;
      });
    };

    const handleVideoHover = (isEntering) => {
      setIsHovered(isEntering);
      if (videoRef.current) {
        if (isEntering) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(console.error);
        } else {
          videoRef.current.pause();
        }
      }
    };

    const handleCopyLink = async (e) => {
      e.stopPropagation();
      const videoUrl = `${window.location.origin}/video/${recentVideo._id}`;

      try {
        await navigator.clipboard.writeText(videoUrl);
        toast.success("Link copied to clipboard");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = videoUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard");
      }
      setOpenShareMenu(null);
    };

    const handleShare = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const videoUrl = `${window.location.origin}/video/${recentVideo._id}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: recentVideo.title,
            text: `Check out this video: ${recentVideo.title}`,
            url: videoUrl,
          });
        } catch (error) {
          console.error("Error sharing:", error);
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(videoUrl);
          toast.success("Link copied to clipboard");
        } catch (error) {
          console.error("Error copying to clipboard:", error);
        }
      }
      setOpenShareMenu(null);
    };

    const handleShareClick = (e) => {
      e.stopPropagation();
      setOpenShareMenu(openShareMenu === cardId ? null : cardId);
    };

    const hasNoVideos =
      !recentVideo ||
      !channel.recentVideos ||
      channel.recentVideos.length === 0;

    return (
      <div>
        <div
          className={`rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-lg ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={() => handleChannelClick(channelId)}
        >
          {/* Video/Thumbnail Section */}
          <div
            className="relative h-48 overflow-hidden"
            onMouseEnter={() => !hasNoVideos && handleVideoHover(true)}
            onMouseLeave={() => !hasNoVideos && handleVideoHover(false)}
          >
            {hasNoVideos ? (
              <div
                className={`w-full h-full flex flex-col items-center justify-center ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <VideoOff
                  size={32}
                  className={`mb-2 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-sm text-center px-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  This channel hasn't posted any videos yet
                </p>
              </div>
            ) : (
              <>
                {/* Video thumbnail - shown when not hovered */}
                <img
                  src={recentVideo.thumbnail.url}
                  alt={recentVideo.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isHovered ? "opacity-0" : "opacity-100"
                  }`}
                />

                {/* Video player - shown on hover */}
                <video
                  ref={videoRef}
                  src={recentVideo.videoFile.url}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                  muted={isMuted}
                  loop
                  playsInline
                />

                {/* Duration badge */}
                {recentVideo.duration && (
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(recentVideo.duration)}
                    </span>
                  </div>
                )}

                {/* Play button overlay - only shown when not hovered */}
                {!isHovered && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play size={20} className="text-gray-800 ml-1" />
                    </div>
                  </div>
                )}

                {/* Mute button - shown when hovered and video is playing */}
                {isHovered && (
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={handleMuteToggle}
                      className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      {isMuted ? (
                        <VolumeX size={16} className="text-white" />
                      ) : (
                        <Volume2 size={16} className="text-white" />
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Content Section */}
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={channel.channelDetails.avatar}
                  alt={channel.channelDetails.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>

            {/* Channel/Video Info */}
            <div className="flex-1 min-w-0">
              {hasNoVideos ? (
                <>
                  <h3
                    className={`text-sm font-medium line-clamp-2 mb-1 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {channel.channelDetails.fullName}
                  </h3>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    @{channel.channelDetails.userName}
                  </p>
                </>
              ) : (
                <>
                  <h3
                    className={`text-sm font-medium line-clamp-2 mb-1 cursor-pointer hover:underline ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                    onClick={(e) => handleVideoClick(recentVideo._id, e)}
                  >
                    {recentVideo.title}
                  </h3>

                  <p
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {channel.channelDetails.fullName}
                  </p>
                  {!hasNoVideos && (
                    <div className="flex items-center right-20 gap-2 text-xs mt-1">
                      <span
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        {formatViewCount(recentVideo.views)} views
                      </span>
                      <span
                        className={
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }
                      >
                        •
                      </span>
                      <span
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        {formatTimeAgo(recentVideo.createdAt)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Share Menu - only show if there are videos */}
            {!hasNoVideos && (
              <div className="flex-shrink-0 relative share-menu-container">
                <button
                  onClick={handleShareClick}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    openShareMenu === cardId
                      ? isDarkMode
                        ? "bg-gray-600 text-white"
                        : "bg-gray-200 text-gray-900"
                      : isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <MoreVertical size={16} />
                </button>

                {/* Share Dropdown Menu */}
                {openShareMenu === cardId && (
                  <div
                    className={`absolute right-0 top-5 w-48 rounded-lg shadow-lg border z-50 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="py-2">
                      <button
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center gap-3 ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={handleShare}
                      >
                        <Share2 size={14} />
                        Share
                      </button>

                      <button
                        className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 flex items-center gap-3 ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={handleCopyLink}
                      >
                        <Link size={14} />
                        Copy link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed views and created at alignment */}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors  duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 border-b ${
          isDarkMode
            ? "bg-transparent backdrop-blur border-gray-700"
            : "bg-transparent backdrop-blur border-gray-200"
        }`}
      >
        <div className="px-1 py-1">
          <div className="flex items-center  top-1 lg:justify-between gap-6 lg:gap-0 lg:mx-4 ">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            {/* Right side - Search */}
            <div className="relative">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-64 rounded-lg border-b transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {loading ? (
          <LoadingSpinner />
        ) : filteredChannels.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredChannels.map((channel) => (
              <ChannelCard key={channel._id} channel={channel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribedChannels;
