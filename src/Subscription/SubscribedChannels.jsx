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
  const [toggleLoading, setToggleLoading] = useState({}); // Track loading state for each channel

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSubscribedChannels(page);
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
    const [showShareMenu, setShowShareMenu] = useState(false);
    const videoRef = useRef(null);

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
        // You might want to show a toast notification here
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
      }
      setShowShareMenu(false);
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
          toast("Link copied to clipboard");
        } catch (error) {
          console.error("Error copying to clipboard:", error);
        }
      }
      setShowShareMenu(false);
    };
    const handleShareClick = (e) => {
      e.stopPropagation();
      setShowShareMenu(!showShareMenu);
    };

    const hasNoVideos =
      !recentVideo ||
      !channel.recentVideos ||
      channel.recentVideos.length === 0;

    return (
      <div
        className={` grid grid-cols-1  rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
          isDarkMode
            ? "bg-gray-900 hover:shadow-xl "
            : "bg-white hover:shadow-xl "
        }`}
        onClick={() => handleChannelClick(channelId)}
      >
        <div
          className="relative h-48 overflow-hidden"
          onMouseEnter={() => !hasNoVideos && handleVideoHover(true)}
          onMouseLeave={() => !hasNoVideos && handleVideoHover(false)}
        >
          {hasNoVideos ? (
            <div
              className={`w-full h-full flex flex-col items-center justify-center ${
                isDarkMode ? "bg-gray-800" : "bg-gray-100"
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
                className={`w-full h-full rounded-t-xl object-cover transition-all duration-300 ${
                  isHovered ? "opacity-0" : "opacity-100"
                }`}
              />

              {/* Video player - shown on hover */}
              <video
                ref={videoRef}
                src={recentVideo.videoFile.url}
                className={`absolute inset-0 w-full h-full  object-cover transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                muted={isMuted}
                loop
                playsInline
              />
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

        {/* Bottom Section */}
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Left: Channel Avatar */}
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

            {/* Middle: Channel/Video Info Column */}
            <div className="flex-1 min-w-0">
              {hasNoVideos ? (
                // Show channel info when no videos
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
                // Show video info when videos exist
                <>
                  <h3
                    className={`text-sm font-medium line-clamp-2 mb-1 ${
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

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {formatViewCount(recentVideo.views)} views
                    </span>
                    <span
                      className={isDarkMode ? "text-gray-500" : "text-gray-400"}
                    >
                      •
                    </span>
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {formatTimeAgo(recentVideo.createdAt)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Share Menu - only show if there are videos */}
            {!hasNoVideos && (
              <div className="flex-shrink-0 relative">
                <button
                  onClick={handleShareClick}
                  className={`p-1 rounded-full hover:bg-opacity-10 transition-colors duration-200 ${
                    isDarkMode
                      ? "hover:bg-white text-gray-400 hover:text-white"
                      : "hover:bg-gray-900 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <MoreVertical size={16} />
                </button>

                {/* Share Dropdown Menu */}
                {showShareMenu && (
                  <div
                    className={`absolute right-0 top-8 w-48 rounded-lg shadow-lg border z-10 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="py-2">
                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-opacity-10 transition-colors duration-200 flex items-center gap-2 ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-white hover:text-white"
                            : "text-gray-700 hover:bg-gray-700 hover:text-gray-900"
                        }`}
                        onClick={handleShare}
                      >
                        <Share2 size={14} />
                        Share
                      </button>

                      <button
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-opacity-10 transition-colors duration-200 flex items-center gap-2 ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-white hover:text-white"
                            : "text-gray-700 hover:bg-gray-900 hover:text-gray-900"
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
        </div>

        {/* Close dropdown when clicking outside */}
        {showShareMenu && (
          <div
            className="fixed inset-0 z-5"
            onClick={(e) => {
              e.stopPropagation();
              setShowShareMenu(false);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div className="">
        <div
          className={` overflow-hidden transition-colors duration-300 ${
            isDarkMode ? "bg-gray-900 " : "bg-white "
          } `}
        >
          {/* Content */}
          <div className="p-8">
            {loading ? (
              <LoadingSpinner />
            ) : filteredChannels.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-6 grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredChannels.map((channel) => (
                  <ChannelCard key={channel._id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribedChannels;
