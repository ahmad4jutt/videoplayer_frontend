import React, { useState, useEffect } from "react";
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

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [removingVideo, setRemovingVideo] = useState(null);
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

  const getTotalDuration = () => {
    if (
      !playlist?.videos ||
      !Array.isArray(playlist.videos) ||
      playlist.videos.length === 0
    ) {
      return "0:00";
    }

    let totalSeconds = 0;
    playlist.videos.forEach((video) => {
      if (video?.duration) {
        if (typeof video.duration === "number") {
          totalSeconds += video.duration;
        } else if (typeof video.duration === "string") {
          const [minutes, seconds] = video.duration.split(":").map(Number);
          totalSeconds += minutes * 60 + seconds;
        }
      }
    });

    return formatDuration(totalSeconds);
  };

  const handleShare = () => {
    setShowShareModal(true);
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

  const handleRemoveVideo = async (videoId) => {
    if (!playlist || !token) return;

    try {
      setRemovingVideo(videoId);
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

  const isOwner = playlist?.owner?._id === currentUser?._id;

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
      {/* Mobile-first responsive container */}
      <div className="w-full max-w-none xl:max-w-7xl xl:mx-auto">
        {/* Mobile Header */}
        <div
          className={`sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-md bg-white/80 xl:hidden ${
            isDarkMode ? "border-gray-700 bg-gray-900/80" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Share2 className="w-5 h-5" />
              </button>
              {isOwner && (
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden xl:block px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-6 px-3 py-2 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="px-4 xl:px-8">
          <div
            className={`rounded-none xl:rounded-2xl shadow-none xl:shadow-lg overflow-hidden mb-4 xl:mb-8 ${
              isDarkMode
                ? "bg-gray-800 xl:border xl:border-gray-700"
                : "bg-white xl:border xl:border-gray-200"
            }`}
          >
            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative p-4 sm:p-6 xl:p-8">
                {/* Mobile Layout */}
                <div className="xl:hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wider">
                      Playlist
                    </span>
                    {playlist.isPublic ? (
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span className="text-xs">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span className="text-xs">Private</span>
                      </div>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">
                    {playlist.name || "Untitled Playlist"}
                  </h1>

                  {playlist.description && (
                    <p className="text-gray-200 mb-4 text-sm leading-relaxed line-clamp-3">
                      {playlist.description}
                    </p>
                  )}

                  {/* Mobile Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span className="font-medium">
                        {playlist.videos?.length || 0}
                      </span>
                      <span>videos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{getTotalDuration()}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden xl:block">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 sm:w-32 h-24 sm:h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                        <Play className="w-8 sm:w-12 h-8 sm:h-12 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wider">
                          Playlist
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 line-clamp-2">
                        {playlist.name || "Untitled Playlist"}
                      </h1>
                      {playlist.description && (
                        <p className="text-gray-200 mb-4 max-w-3xl line-clamp-2 text-sm sm:text-base">
                          {playlist.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Play className="w-4 h-4" />
                          <span className="font-medium">
                            {playlist.videos?.length || 0}
                          </span>
                          <span>videos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {getTotalDuration()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Updated{" "}
                            {playlist.updatedAt
                              ? formatDate(playlist.updatedAt)
                              : "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {playlist.isPublic ? (
                            <>
                              <Globe className="w-4 h-4" />
                              <span className="px-2 py-1 bg-green-500/20 text-green-200 rounded-full text-xs font-medium">
                                Public
                              </span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span className="px-2 py-1 bg-red-500/20 text-red-200 rounded-full text-xs font-medium">
                                Private
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Section */}
            {playlist.owner && (
              <div
                className={`p-4 xl:p-6 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <img
                      src={playlist.owner.avatar}
                      alt={playlist.owner.fullName}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-semibold text-sm sm:text-base truncate ${
                          isDarkMode ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        {playlist.owner.fullName}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm truncate ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        @{playlist.owner.userName}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    {isOwner && (
                      <button
                        className={`p-2.5 rounded-lg transition-all duration-200 ${
                          isDarkMode
                            ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Videos Section */}
        <div className="px-4 xl:px-8 pb-4 xl:pb-8">
          <div
            className={`rounded-none xl:rounded-2xl shadow-none xl:shadow-lg overflow-hidden ${
              isDarkMode
                ? "bg-gray-800 xl:border xl:border-gray-700"
                : "bg-white xl:border xl:border-gray-200"
            }`}
          >
            <div
              className={`p-4 sm:p-6 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-lg xl:text-xl font-semibold ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Videos ({playlist?.videos?.length || 0})
              </h2>
            </div>

            {!playlist?.videos || playlist.videos.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
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
                  className={`mb-6 max-w-md mx-auto ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  This playlist is empty. Videos will appear here once they're
                  added to the playlist.
                </p>
              </div>
            ) : (
              <div
                className={`divide-y ${
                  isDarkMode ? "divide-gray-700" : "divide-gray-100"
                }`}
              >
                {playlist.videos.map((video, index) => (
                  <div
                    key={video._id}
                    className={`group relative transition-all duration-200 ${
                      isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-blue-500 opacity-0 group-hover:opacity-100"
                          : "bg-blue-600 opacity-0 group-hover:opacity-100"
                      }`}
                    ></div>

                    <div className="p-3 sm:p-4 xl:p-6">
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 text-center">
                            <span
                              className={`text-sm font-medium ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/video/${video._id}`} className="block">
                              <div className="relative group/thumb mb-3">
                                <img
                                  src={video.thumbnail?.url || video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-26 aspect-video object-cover rounded-lg"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(video.duration)}
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                  <Play className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              <h3
                                className={`font-medium mb-2 line-clamp-2 text-sm transition-colors duration-200 ${
                                  isDarkMode
                                    ? "text-gray-100 group-hover:text-blue-400"
                                    : "text-gray-900 group-hover:text-blue-600"
                                }`}
                              >
                                {video.title}
                              </h3>

                              <div
                                className={`flex items-center gap-3 text-xs ${
                                  isDarkMode ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{formatViews(video.views)}</span>
                                </div>
                              </div>
                            </Link>
                            {isOwner && (
                              <button
                                onClick={() => handleRemoveVideo(video._id)}
                                disabled={removingVideo === video._id}
                                className={`mt-2 p-2 rounded-lg transition-all duration-200 ${
                                  removingVideo === video._id
                                    ? "opacity-50 cursor-not-allowed"
                                    : isDarkMode
                                    ? "text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                    : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-6 text-center">
                          <span
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>

                        <Link
                          to={`/video/${video._id}`}
                          className="flex-1 min-w-0"
                        >
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="flex-shrink-0 relative group/thumb w-full sm:w-40">
                              <img
                                src={video.thumbnail?.url || video.thumbnail}
                                alt={video.title}
                                className="w-full sm:w-40 h-24 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {formatDuration(video.duration)}
                              </div>
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-medium mb-2 line-clamp-2 transition-colors duration-200 ${
                                  isDarkMode
                                    ? "text-gray-100 group-hover:text-blue-400"
                                    : "text-gray-900 group-hover:text-blue-600"
                                }`}
                              >
                                {video.title}
                              </h3>
                              {video.description && (
                                <p
                                  className={`text-sm mb-3 line-clamp-2 ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {video.description}
                                </p>
                              )}
                              <div
                                className={`flex flex-wrap items-center gap-4 text-xs ${
                                  isDarkMode ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{formatViews(video.views)} views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDuration(video.duration)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>

                        {isOwner && (
                          <button
                            onClick={() => handleRemoveVideo(video._id)}
                            disabled={removingVideo === video._id}
                            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                              removingVideo === video._id
                                ? "opacity-50 cursor-not-allowed"
                                : isDarkMode
                                ? "text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                            }`}
                            title="Remove from playlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

              {/* Social Share Options */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p
                  className={`text-sm font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Share on social media
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">f</span>
                    </div>
                    <span className="text-xs">Facebook</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span className="text-xs">Twitter</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">@</span>
                    </div>
                    <span className="text-xs">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-4 sm:hidden">
        <button
          onClick={handleShare}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default PlaylistById;
