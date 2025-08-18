import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Play,
  ChevronLeft,
  Share2,
  MoreVertical,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { getLikedVideos } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LikedVideo = () => {
  const navigate = useNavigate();
  const dropdownRefs = useRef({});

  const [likedVideos, setLikedVideos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { token, currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        if (!dropdownRefs.current[openDropdown].contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getLikedVideos(token);

      if (response.data?.data?.videos) {
        const videos = response.data.data.videos;

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

  const handleBack = () => {
    navigate(-1);
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalViews = () => {
    if (!Array.isArray(likedVideos) || likedVideos.length === 0) {
      return 0;
    }

    let totalViews = 0;
    likedVideos.forEach((video) => {
      if (video?.views) {
        totalViews += video.views;
      }
    });

    return totalViews;
  };

  const handleCopyLink = async () => {
    try {
      const likedVideosUrl = `${window.location.origin}/liked-videos`;
      await navigator.clipboard.writeText(likedVideosUrl);
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setShowShareModal(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShareVideo = async (video) => {
    try {
      const videoUrl = `${window.location.origin}/video/${video._id}`;
      await navigator.clipboard.writeText(videoUrl);
      toast.success("Video link copied to clipboard!");
      setOpenDropdown(null);
    } catch (err) {
      console.error("Failed to copy video link:", err);
      toast.error("Failed to copy link");
    }
  };

  const toggleDropdown = (videoId) => {
    setOpenDropdown(openDropdown === videoId ? null : videoId);
  };

  // Helper function to check if there are liked videos
  const hasVideos = likedVideos && likedVideos.length > 0;

  // Helper function to filter videos based on active tab
  const getFilteredVideos = () => {
    if (activeTab === "all") {
      return likedVideos;
    } else if (activeTab === "videos") {
      return likedVideos.filter((video) => video.duration > 60);
    } else if (activeTab === "shorts") {
      return likedVideos.filter((video) => video.duration <= 60);
    }
    return likedVideos;
  };

  const filteredVideos = getFilteredVideos();
  const hasFilteredVideos = filteredVideos && filteredVideos.length > 0;

  // Helper function to get counts for each tab
  const getTabCounts = () => {
    const videos = likedVideos.filter((video) => video.duration > 60);
    const shorts = likedVideos.filter((video) => video.duration <= 60);
    return {
      all: likedVideos.length,
      videos: videos.length,
      shorts: shorts.length,
    };
  };

  const tabCounts = getTabCounts();

  // Helper function to get background image or fallback
  const getBackgroundImage = () => {
    if (hasVideos) {
      return likedVideos[0]?.thumbnail?.url || likedVideos[0]?.thumbnail || "";
    }
    return "";
  };

  // Helper function to get fallback background for empty liked videos
  const getEmptyLikedVideosBackground = () => {
    return "linear-gradient(135deg, #e91e63 0%, #ad1457 25%, #880e4f 50%, #c2185b 75%, #e91e63 100%)";
  };

  // Helper function to render description with show more/less functionality
  const renderDescription = (isMobile = false) => {
    const description =
      "Your collection of liked videos from across the platform";
    const maxLength = isMobile ? 80 : 120;
    const isLong = description.length > maxLength;
    const shouldTruncate = isLong && !showFullDescription;
    const displayText = shouldTruncate
      ? description.substring(0, maxLength) + "..."
      : description;

    return (
      <div className="text-sm font-light text-white/90 leading-relaxed">
        <p className="mb-1">{displayText}</p>
        {isLong && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-xs text-white/80 hover:text-white underline transition-colors"
          >
            {showFullDescription ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
              isDarkMode ? "border-red-400" : "border-red-600"
            }`}
          ></div>
          <p
            className={`mt-4 text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading liked videos...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2
            className={`text-xl font-semibold mb-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Error loading liked videos
          </h2>
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {error}
          </p>
          <button
            onClick={fetchLikedVideos}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 mr-3"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Mobile Layout - Full Background Card */}
      <div className="lg:hidden">
        <div className="relative min-h-screen">
          {/* Background Image with Blur - Mobile Full Screen */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: hasVideos
                ? `url(${getBackgroundImage()})`
                : getEmptyLikedVideosBackground(),
            }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
          </div>

          {/* Content */}
          <div className="relative p-4 text-white">
            {/* Back Button - Mobile */}
            <button
              onClick={handleBack}
              className="inline-flex items-center space-x-1 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Liked Videos Info Section */}
            <div className="mb-6">
              {/* Liked Videos Thumbnail */}
              <div className="mb-4">
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  {hasVideos ? (
                    <img
                      src={getBackgroundImage()}
                      alt="Liked Videos"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: getEmptyLikedVideosBackground() }}
                    >
                      <Heart className="w-16 h-16 text-white/60 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              {/* Liked Videos Details */}
              <div className="space-y-3">
                {/* Title */}
                <div>
                  <h1 className="text-xl font-bold leading-tight line-clamp-2">
                    Liked Videos
                  </h1>
                </div>

                {/* Owner Info */}
                {currentUser && (
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        by {currentUser.fullName}
                      </p>
                      <p className="text-xs text-white/80">
                        @{currentUser.userName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-white/80 font-medium tracking-wider">
                      Liked Videos
                    </span>
                    <span>·</span>
                    <span>{likedVideos.length} videos</span>
                  </div>

                  {/* Description */}
                  <div className="mt-2">{renderDescription(true)}</div>
                </div>
              </div>
            </div>

            {/* Videos List - Mobile */}
            <div className="space-y-1">
              {/* Tab Navigation - Mobile */}
              <div className="flex space-x-1 mb-4 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  All ({tabCounts.all})
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "videos"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Videos ({tabCounts.videos})
                </button>
                <button
                  onClick={() => setActiveTab("shorts")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === "shorts"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Shorts ({tabCounts.shorts})
                </button>
              </div>

              {!hasFilteredVideos ? (
                <div className="rounded-2xl text-center p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/10">
                    <Heart className="w-8 h-8 text-white/60 fill-current" />
                  </div>
                  <h3 className="text-base font-medium mb-2 text-white">
                    No{" "}
                    {activeTab === "all"
                      ? "liked videos"
                      : activeTab === "videos"
                      ? "liked videos"
                      : "liked shorts"}{" "}
                    yet
                  </h3>
                  <p className="max-w-md mx-auto text-sm text-white/70">
                    {activeTab === "all"
                      ? "Videos you like will appear here. Start exploring and like some videos!"
                      : activeTab === "videos"
                      ? "Videos longer than 1 minute that you've liked will appear here."
                      : "Short videos (60 seconds or less) that you've liked will appear here."}
                  </p>
                </div>
              ) : (
                filteredVideos.map((video, index) => (
                  <div
                    key={video._id}
                    className="group relative rounded-xl py-2 transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm mb-2"
                  >
                    <div className="flex gap-3">
                      {/* Video Index */}
                      <div className="flex-shrink-0 w-3 flex items-center justify-center">
                        <span className="text-sm font-medium text-white/80">
                          {index + 1}
                        </span>
                      </div>

                      {/* Video Content */}
                      <Link
                        to={
                          video.duration > 60
                            ? `/video/${video._id}`
                            : `/video/${video._id}`
                        }
                        className="flex-1 min-w-0"
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 relative group/thumb">
                            <div className="w-32 aspect-video rounded-lg overflow-hidden">
                              <img
                                src={video.thumbnail?.url || video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                              />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                              {formatDuration(video.duration)}
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="flex-1 min-w-0 py-1">
                            <h3 className="font-semibold mb-1 line-clamp-2 text-sm text-white group-hover:text-pink-300 transition-colors duration-200">
                              {video.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                              <span>{video.owner?.fullName}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-white/70">
                              <span>{formatViews(video.views)} views</span>
                              <span>·</span>
                              <span>{formatDate(video.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* More Options Dropdown */}
                      <div
                        className="flex-shrink-0 relative"
                        ref={(el) => (dropdownRefs.current[video._id] = el)}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDropdown(video._id);
                          }}
                          className="p-1.5 rounded-lg transition-all duration-200 text-white/60 hover:text-white hover:bg-white/20"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === video._id && (
                          <div
                            className={`absolute right-0 top-8 mt-2 w-44 rounded-lg shadow-lg border z-50 ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="py-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleShareVideo(video);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${
                                  isDarkMode
                                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                              >
                                <Share2 className="w-4 h-4" />
                                Share video
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-row gap-8 h-full">
            {/* Left Section - Liked Videos Card - Desktop Fixed Sidebar */}
            <div className="w-[25%] fixed top-20 h-[calc(100vh-80px)] z-30">
              <div className="relative rounded-2xl overflow-hidden shadow-lg h-full">
                {/* Background Image with Blur or Custom Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: hasVideos
                      ? `url(${getBackgroundImage()})`
                      : getEmptyLikedVideosBackground(),
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
                </div>

                {/* Content */}
                <div className="relative p-6 text-white h-96 flex flex-col">
                  {/* Back Button - Desktop */}
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center space-x-1 text-white/80 hover:text-white mb-4 transition-colors self-start"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back</span>
                  </button>

                  {/* Liked Videos Thumbnail */}
                  <div className="mb-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                      {hasVideos ? (
                        <img
                          src={getBackgroundImage()}
                          alt="Liked Videos"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: getEmptyLikedVideosBackground(),
                          }}
                        >
                          <Heart className="w-12 h-12 text-white/60 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Liked Videos Info */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <h1 className="text-2xl font-bold leading-tight line-clamp-2">
                        Liked Videos
                      </h1>
                    </div>

                    {/* Owner Info */}
                    {currentUser && (
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            by {currentUser.fullName}
                          </p>
                          <p className="text-xs text-white/80">
                            @{currentUser.userName}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="pt-4">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-white/80 font-medium tracking-wider">
                          Liked Videos
                        </span>
                        <span>·</span>
                        <span>{likedVideos.length} videos</span>
                      </div>

                      {/* Description */}
                      <div className="mt-3">{renderDescription(false)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Videos List - Desktop */}
            <div className="w-[70%] ml-[33%]">
              {/* Tab Navigation - Desktop - Sticky */}
              {hasVideos && (
                <div
                  className={`sticky top-20 z-40 mb-2 ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-50"
                  } pb-4`}
                >
                  <div
                    className={`flex space-x-1 p-1 rounded-lg ${
                      isDarkMode ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === "all"
                          ? isDarkMode
                            ? "bg-gray-700 text-white shadow-sm"
                            : "bg-white text-gray-900 shadow-sm"
                          : isDarkMode
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      All ({tabCounts.all})
                    </button>
                    <button
                      onClick={() => setActiveTab("videos")}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === "videos"
                          ? isDarkMode
                            ? "bg-gray-700 text-white shadow-sm"
                            : "bg-white text-gray-900 shadow-sm"
                          : isDarkMode
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Videos ({tabCounts.videos})
                    </button>
                    <button
                      onClick={() => setActiveTab("shorts")}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === "shorts"
                          ? isDarkMode
                            ? "bg-gray-700 text-white shadow-sm"
                            : "bg-white text-gray-900 shadow-sm"
                          : isDarkMode
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      Shorts ({tabCounts.shorts})
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Videos Grid - Desktop */}
                {!hasFilteredVideos ? (
                  <div
                    className={`rounded-2xl text-center p-8 ${
                      isDarkMode ? "bg-transparent" : "bg-transparent"
                    }`}
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <Heart
                        className={`w-10 h-10 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        } fill-current`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-medium mb-2 ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      No{" "}
                      {activeTab === "all"
                        ? "liked videos"
                        : activeTab === "videos"
                        ? "liked videos"
                        : "liked shorts"}{" "}
                      yet
                    </h3>
                    <p
                      className={`max-w-md mx-auto text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {activeTab === "all"
                        ? "Videos you like will appear here. Start exploring and like some videos!"
                        : activeTab === "videos"
                        ? "Videos longer than 1 minute that you've liked will appear here."
                        : "Short videos (60 seconds or less) that you've liked will appear here."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredVideos.map((video, index) => (
                      <div
                        key={video._id}
                        className={`group relative rounded-2xl py-3 transition-all duration-200 ${
                          isDarkMode
                            ? "bg-transparent hover:bg-gray-700/70"
                            : "bg-transparent hover:bg-gray-100"
                        } backdrop-blur-sm`}
                      >
                        <div className="flex gap-4">
                          {/* Video Index */}
                          <div className="flex-shrink-0 w-3 flex items-center justify-center">
                            <span
                              className={`text-sm font-medium ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>

                          {/* Video Content */}
                          <Link
                            to={
                              video.duration > 60
                                ? `/video/${video._id}`
                                : `/video/${video._id}`
                            }
                            className="flex-1 min-w-0"
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Thumbnail */}
                              <div className="flex-shrink-0 relative group/thumb">
                                <div className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden">
                                  <img
                                    src={
                                      video.thumbnail?.url || video.thumbnail
                                    }
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
                                  />
                                </div>
                                {/* Video Duration Badge with Type Indicator */}
                                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded">
                                    {formatDuration(video.duration)}
                                  </div>
                                  {video.duration <= 60 && (
                                    <div className="bg-red-500 text-white text-[10px] px-1.5 py-1 rounded font-medium">
                                      SHORT
                                    </div>
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                                  <Play className="w-8 h-8 text-white" />
                                </div>
                              </div>

                              {/* Video Info */}
                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-semibold mb-2 line-clamp-2 text-lg transition-colors duration-200 ${
                                    isDarkMode
                                      ? "text-gray-100 group-hover:text-gray-500"
                                      : "text-gray-900 group-hover:text-gray-500"
                                  }`}
                                >
                                  {video.title}
                                </h3>

                                <div
                                  className={`flex items-center gap-2 text-sm mb-1 ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  <span>{video.owner?.fullName}</span>
                                </div>

                                <div
                                  className={`flex items-center gap-4 text-sm ${
                                    isDarkMode
                                      ? "text-gray-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>{formatViews(video.views)} views</span>
                                  <span>·</span>
                                  <span>{formatDate(video.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </Link>

                          {/* More Options Dropdown */}
                          <div
                            className="flex-shrink-0 relative"
                            ref={(el) => (dropdownRefs.current[video._id] = el)}
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleDropdown(video._id);
                              }}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                isDarkMode
                                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              }`}
                              title="More options"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {/* Dropdown Menu */}
                            {openDropdown === video._id && (
                              <div
                                className={`absolute right-0 top-10 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                                  isDarkMode
                                    ? "bg-gray-800 border-gray-700"
                                    : "bg-white border-gray-200"
                                }`}
                              >
                                <div className="py-2">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleShareVideo(video);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                      isDarkMode
                                        ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                  >
                                    <Share2 className="w-4 h-4" />
                                    Share video
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikedVideo;
