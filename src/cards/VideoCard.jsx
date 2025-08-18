import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Eye,
  Clock,
  Calendar,
  MoreVertical,
  Share2,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  X,
  Play,
  VolumeX,
  Volume2,
} from "lucide-react";

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const videoRef = useRef(null);

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || "0";
  };

  const formatDuration = (second) => {
    if (!second) return "0:00";

    const totalSeconds = Math.round(second);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleVideoHover = (isEntering) => {
    setIsHovered(isEntering);
    if (videoRef.current && video.videoFile?.url) {
      if (isEntering) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleMuteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted((prev) => {
      const newMutedState = !prev;
      if (videoRef.current) {
        videoRef.current.muted = newMutedState;
      }
      return newMutedState;
    });
  };

  const getVideoUrl = () => {
    return `${window.location.origin}/video/${video._id}`;
  };

  const handleCopyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(getVideoUrl());
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = getVideoUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    }
  };

  const handleSocialShare = (platform) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    const videoUrl = getVideoUrl();
    const videoTitle = video.title || "Check out this video";

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          videoUrl
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          videoUrl
        )}&text=${encodeURIComponent(videoTitle)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          `${videoTitle} ${videoUrl}`
        )}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  return (
    <div className="group cursor-pointer">
      <Link to={`/video/${video._id}`} className="block">
        {/* Image Card - Rounded with shadow and hover video functionality */}
        <div
          className={`relative aspect-video overflow-hidden sm:rounded-none lg:rounded-xl ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          } shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-3`}
          onMouseEnter={() => handleVideoHover(true)}
          onMouseLeave={() => handleVideoHover(false)}
        >
          {/* Thumbnail Image - shown when not hovered or no video file */}
          {video.thumbnail && (
            <img
              src={video.thumbnail.url}
              alt={video.title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isHovered && video.videoFile?.url ? "opacity-0" : "opacity-100"
              } ${!isHovered ? "group-hover:scale-105" : ""}`}
            />
          )}

          {/* Video Player - shown on hover if video file exists */}
          {video.videoFile?.url && (
            <video
              ref={videoRef}
              src={video.videoFile.url}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              muted={isMuted}
              loop
              playsInline
            />
          )}

          {/* Fallback for no thumbnail */}
          {!video.thumbnail && (
            <div
              className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
                isDarkMode
                  ? "from-gray-600 to-gray-700"
                  : "from-gray-300 to-gray-400"
              }`}
            >
              <span
                className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } text-lg font-medium`}
              >
                No Thumbnail
              </span>
            </div>
          )}

          {/* Play button overlay - only shown when not hovered */}
          {!isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Play size={20} className="text-gray-800 ml-1" />
              </div>
            </div>
          )}

          {/* Duration Badge - always shown */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock size={12} />
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Mute button - shown when hovered and video is playing */}
          {isHovered && video.videoFile?.url && (
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
        </div>
      </Link>

      {/* Text Content - Outside the card */}
      <Link to={`/channel/${video.createdBy._id}`}>
        <div className="flex items-start gap-3 space-y-0">
          {/* Left Section - Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              <img
                src={video.createdBy.avatar}
                alt={video.createdBy?.fullName || "Unknown Channel"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* Middle Section - Video Info */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Video Title */}
            <h3
              className={`font-bold ${
                isDarkMode
                  ? "text-white group-hover:text-gray-300"
                  : "text-gray-900 group-hover:text-gray-600"
              } text-xl leading-tight line-clamp-2 transition-colors`}
            >
              {video.title || "Untitled Video"}
            </h3>

            {/* Creator Full Name */}
            <p
              className={`${
                isDarkMode ? "text-gray-300" : "text-gray-900"
              } text-sm font-semibold truncate`}
            >
              {video.createdBy?.fullName || "Unknown Channel"}
            </p>

            {/* Video Stats - Views and Date */}
            <div
              className={`flex items-center gap-4 text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{formatViews(video.views)} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Section - Share Menu */}
          <div className="flex-shrink-0  relative">
            <button
              ref={buttonRef}
              onClick={handleShareClick}
              className={`p-2 rounded-full ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } transition-colors`}
            >
              <MoreVertical
                size={16}
                className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              />
            </button>

            {/* Share Dropdown Menu */}
            {showShareMenu && (
              <div
                ref={menuRef}
                className={`absolute right-0 -top-24  mt-1 w-48 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } rounded-lg shadow-lg border py-2 z-50`}
              >
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } flex items-center gap-3`}
                >
                  <Copy size={16} />
                  {copySuccess ? "Copied!" : "Copy link"}
                </button>

                {/* Divider */}
                <div
                  className={`border-t ${
                    isDarkMode ? "border-gray-600" : "border-gray-200"
                  } my-1`}
                ></div>

                {/* Social Share Options */}
                <button
                  onClick={handleSocialShare("facebook")}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } flex items-center gap-3`}
                >
                  <Facebook size={16} className="text-blue-600" />
                  Share on Facebook
                </button>

                <button
                  onClick={handleSocialShare("twitter")}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } flex items-center gap-3`}
                >
                  <Twitter size={16} className="text-blue-400" />
                  Share on Twitter
                </button>

                <button
                  onClick={handleSocialShare("whatsapp")}
                  className={`w-full px-4 py-2 text-left text-sm ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } flex items-center gap-3`}
                >
                  <MessageCircle size={16} className="text-green-500" />
                  Share on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;
