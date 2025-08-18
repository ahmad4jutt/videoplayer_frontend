import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Play,
  Clock,
  Eye,
  Calendar,
  Share2,
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  X,
  MoreVertical,
  Lock,
  Globe,
  Users,
  Heart,
  Download,
  Settings,
  CopyIcon,
  CopyCheck,
} from "lucide-react";

import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { getPlaylistById, removeVideoFromPlaylist } from "../../services/api";
import { toast } from "react-toastify";

const PlaylistById = () => {
  const { playlistId } = useParams();
  const { videoId } = useParams();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const dropdownRefs = useRef({});

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [removingVideo, setRemovingVideo] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { token, currentUser } = useAuth();

  useEffect(() => {
    if (!playlistId) {
      setError("Playlist ID is required");
      setLoading(false);
      return;
    }
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        const response = await getPlaylistById(
          token,
          playlistId || "demo-playlist"
        );
        setPlaylist(response.data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [token, playlistId]);

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

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const getTotalViews = () => {
    if (
      !playlist?.videos ||
      !Array.isArray(playlist.videos) ||
      playlist.videos.length === 0
    ) {
      return 0;
    }

    let totalViews = 0;
    playlist.videos.forEach((video) => {
      if (video?.views) {
        totalViews += video.views;
      }
    });

    return totalViews;
  };

  const handleCopyLink = async () => {
    try {
      const playlistUrl = `${window.location.origin}/playlist/${playlistId}`;
      await navigator.clipboard.writeText(playlistUrl);
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

  const handleRemoveVideo = async (videoId) => {
    if (!playlist || !token) return;

    try {
      setRemovingVideo(videoId);
      setOpenDropdown(null);
      await removeVideoFromPlaylist(token, videoId, playlistId);

      setPlaylist((prevPlaylist) => ({
        ...prevPlaylist,
        videos: prevPlaylist.videos.filter((video) => video._id !== videoId),
      }));
      toast.success("Video removed successfully");

      if (currentVideo >= playlist.videos.length - 1) {
        setCurrentVideo(Math.max(0, playlist.videos.length - 2));
      }
    } catch (err) {
      console.error("Failed to remove video:", err);
      toast.error("Failed to remove video");
    } finally {
      setRemovingVideo(null);
    }
  };

  const toggleDropdown = (videoId) => {
    setOpenDropdown(openDropdown === videoId ? null : videoId);
  };

  const isOwner = playlist?.owner?._id === currentUser?._id;

  // Helper function to check if playlist has videos
  const hasVideos = playlist?.videos && playlist.videos.length > 0;

  // Helper function to get background image or fallback
  const getBackgroundImage = () => {
    if (hasVideos) {
      return (
        playlist.videos[0]?.thumbnail?.url ||
        playlist.videos[0]?.thumbnail ||
        ""
      );
    }
    return "";
  };

  // Helper function to get fallback background for empty playlist
  const getEmptyPlaylistBackground = () => {
    return "linear-gradient(135deg, #0f0c29 0%, #24243e 25%, #302b63 50%, #8b2635 75%, #c73e1d 100%)";
  };

  // Helper function to render description with show more/less functionality
  const renderDescription = (isMobile = false) => {
    if (!playlist?.description) return null;

    const maxLength = isMobile ? 80 : 120;
    const isLong = playlist.description.length > maxLength;
    const shouldTruncate = isLong && !showFullDescription;
    const displayText = shouldTruncate
      ? playlist.description.substring(0, maxLength) + "..."
      : playlist.description;

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
              isDarkMode ? "border-blue-400" : "border-blue-600"
            }`}
          ></div>
          <p
            className={`mt-4 text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading playlist...
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
            Error loading playlist
          </h2>
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <Play
              className={`w-10 h-10 ${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              }`}
            />
          </div>
          <h2
            className={`text-xl font-semibold mb-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Playlist not found
          </h2>
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            The playlist you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
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
                : getEmptyPlaylistBackground(),
            }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
          </div>

          {/* Content */}
          <div className="relative p-4 text-white">
            {/* Playlist Info Section */}
            <div className="mb-6">
              {/* Playlist Thumbnail */}
              <div className="mb-4">
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  {hasVideos ? (
                    <img
                      src={getBackgroundImage()}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: getEmptyPlaylistBackground() }}
                    >
                      <Play className="w-16 h-16 text-white/60" />
                    </div>
                  )}
                </div>
              </div>

              {/* Playlist Details */}
              <div className="space-y-3">
                {/* Playlist Name */}
                <div>
                  <h1 className="text-xl font-bold leading-tight line-clamp-2">
                    {playlist.name || "Untitled Playlist"}
                  </h1>
                </div>

                {/* Owner Info */}
                {playlist.owner && (
                  <div className="flex items-center gap-3">
                    <img
                      src={playlist.owner.avatar}
                      alt={playlist.owner.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        by {playlist.owner.fullName}
                      </p>
                      <p className="text-xs text-white/80">
                        @{playlist.owner.userName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-white/80 font-medium tracking-wider">
                      Playlist
                    </span>
                    <span>·</span>
                    <span>{playlist.videos?.length || 0} videos</span>
                    <span>·</span>
                    <span>{formatViews(getTotalViews())} views</span>
                  </div>

                  {/* Description */}
                  {playlist.description && (
                    <div className="mt-2">{renderDescription(true)}</div>
                  )}
                </div>

                {/* Share Button */}
                <div>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Videos List - Mobile */}
            <div className="space-y-1">
              {!hasVideos ? (
                <div className="rounded-2xl text-center p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/10">
                    <Play className="w-8 h-8 text-white/60" />
                  </div>
                  <h3 className="text-base font-medium mb-2 text-white">
                    No videos yet
                  </h3>
                  <p className="max-w-md mx-auto text-sm text-white/70">
                    This playlist is empty. Videos will appear here once they're
                    added to the playlist.
                  </p>
                </div>
              ) : (
                playlist.videos.map((video, index) => (
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
                        to={`/video/${video._id}`}
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
                            <h3 className="font-semibold mb-1 line-clamp-2 text-sm text-white group-hover:text-blue-300 transition-colors duration-200">
                              {video.title}
                            </h3>

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

                              {isOwner && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveVideo(video._id);
                                  }}
                                  disabled={removingVideo === video._id}
                                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${
                                    removingVideo === video._id
                                      ? "opacity-50 cursor-not-allowed"
                                      : isDarkMode
                                      ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {removingVideo === video._id
                                    ? "Removing..."
                                    : "Remove from playlist"}
                                </button>
                              )}
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

      {/* Desktop Layout - Original Design */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-row gap-8 h-full">
            {/* Left Section - Playlist Card - Desktop Fixed Sidebar */}
            <div className="w-[25%] fixed top-20 h-[calc(98vh-80px)]">
              <div className="relative rounded-2xl overflow-hidden shadow-lg h-full">
                {/* Background Image with Blur or Custom Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: hasVideos
                      ? `url(${getBackgroundImage()})`
                      : getEmptyPlaylistBackground(),
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
                </div>

                {/* Content */}
                <div className="relative p-6 text-white h-96 flex flex-col">
                  {/* Playlist Thumbnail */}
                  <div className="mb-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden">
                      {hasVideos ? (
                        <img
                          src={getBackgroundImage()}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: getEmptyPlaylistBackground() }}
                        >
                          <Play className="w-12 h-12 text-white/60" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Playlist Info */}
                  <div className="space-y-4">
                    {/* Playlist Name */}
                    <div>
                      <h1 className="text-2xl font-bold leading-tight line-clamp-2">
                        {playlist.name || "Untitled Playlist"}
                      </h1>
                    </div>

                    {/* Owner Info */}
                    {playlist.owner && (
                      <div className="flex items-center gap-3">
                        <img
                          src={playlist.owner.avatar}
                          alt={playlist.owner.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            by {playlist.owner.fullName}
                          </p>
                          <p className="text-xs text-white/80">
                            @{playlist.owner.userName}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="pt-4">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-white/80 font-medium tracking-wider">
                          Playlist
                        </span>
                        <span>·</span>
                        <span>{playlist.videos?.length || 0} videos</span>
                        <span>·</span>
                        <span>{formatViews(getTotalViews())} views</span>
                      </div>

                      {/* Description */}
                      {playlist.description && (
                        <div className="mt-3">{renderDescription(false)}</div>
                      )}
                    </div>

                    {/* Share Button */}
                    <div>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Videos List - Desktop */}
            <div className="w-[70%] ml-[33%] ">
              <div className="space-y-4">
                {/* Videos Grid - Desktop */}
                {!hasVideos ? (
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
                      <Play
                        className={`w-10 h-10 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-medium mb-2 ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      No videos yet
                    </h3>
                    <p
                      className={`max-w-md mx-auto text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      This playlist is empty. Videos will appear here once
                      they're added to the playlist.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {playlist.videos.map((video, index) => (
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
                            to={`/video/${video._id}`}
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
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(video.duration)}
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
                                      ? "text-gray-100 group-hover:text-blue-400"
                                      : "text-gray-900 group-hover:text-blue-600"
                                  }`}
                                >
                                  {video.title}
                                </h3>

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

                                  {isOwner && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveVideo(video._id);
                                      }}
                                      disabled={removingVideo === video._id}
                                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                        removingVideo === video._id
                                          ? "opacity-50 cursor-not-allowed"
                                          : isDarkMode
                                          ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                                          : "text-red-600 hover:bg-red-50 hover:text-red-700"
                                      }`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      {removingVideo === video._id
                                        ? "Removing..."
                                        : "Remove from playlist"}
                                    </button>
                                  )}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Share Playlist
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Playlist Link
                </label>
                <div
                  className={`flex items-center gap-2 p-3 border rounded-lg ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <input
                    type="text"
                    value={`${window.location.origin}/playlist/${playlistId}`}
                    readOnly
                    className={`flex-1 bg-transparent text-sm outline-none ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      shareSuccess
                        ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                        : isDarkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {shareSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {shareSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span>Link copied to clipboard!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistById;
