import React, { useState, useEffect } from "react";
import {
  Search,
  Clock,
  User,
  Eye,
  Calendar,
  Trash2,
  Filter,
  Play,
  SortAsc,
  Grid,
  List,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import {
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
} from "../../services/api";
import { toast } from "react-toastify";

const History = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  useEffect(() => {
    filterAndSortHistory();
  }, [watchHistory, searchTerm, sortBy]);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      const response = await getWatchHistory(token);
      setWatchHistory(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch watch history. Please try again.");
      console.error("Error fetching watch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHistory = () => {
    let filtered = [...watchHistory];

    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "views":
          return b.views - a.views;
        case "duration":
          return b.duration - a.duration;
        default:
          return 0;
      }
    });
    setFilteredHistory(filtered);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
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
    return views.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClearHistory = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear your entire watch history? This action cannot be undone."
      )
    ) {
      try {
        setActionLoading(true);
        await clearWatchHistory(token);
        setWatchHistory([]);
        setFilteredHistory([]);
        setError(null);
      } catch (err) {
        setError("Failed to clear watch history. Please try again.");
        console.error("Error clearing watch history:", err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRemoveFromHistory = async (videoId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (
      window.confirm(
        "Are you sure you want to remove this video from your watch history?"
      )
    ) {
      try {
        setActionLoading(true);
        await removeFromWatchHistory(videoId, token);
        const updatedHistory = watchHistory.filter(
          (video) => video._id !== videoId
        );
        setWatchHistory(updatedHistory);
        setError(null);
        toast.success("Video deleted successfully");
      } catch (err) {
        setError("Failed to remove video from history. Please try again.");
        console.error("Error removing video from history:", err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "oldest", label: "Oldest First" },
    { value: "views", label: "Most Views" },
    { value: "duration", label: "Duration" },
  ];

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`w-48 h-8 rounded-lg animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              </div>
              <div
                className={`w-32 h-10 rounded-lg animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div
                className={`flex-1 h-12 rounded-xl animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-40 h-12 rounded-xl animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className={`backdrop-blur-sm rounded-2xl overflow-hidden border ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/50 border-gray-200/50"
                }`}
              >
                <div
                  className={`h-48 animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div className="p-5 space-y-3">
                  <div
                    className={`h-4 rounded animate-pulse ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 rounded w-3/4 animate-pulse ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div className="flex justify-between">
                    <div
                      className={`h-3 rounded w-16 animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`h-3 rounded w-20 animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        <div
          className={`backdrop-blur-sm rounded-3xl border p-12 text-center max-w-md w-full ${
            isDarkMode
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-white/50 border-gray-200/50"
          }`}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDarkMode ? "bg-red-500/20" : "bg-red-100"
            }`}
          >
            <div
              className={`text-3xl ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              ⚠️
            </div>
          </div>
          <h2
            className={`text-2xl font-bold mb-4 ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Something went wrong
          </h2>
          <p
            className={`mb-8 leading-relaxed ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {error}
          </p>
          <button
            onClick={fetchWatchHistory}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className={` ${
                    isDarkMode ? "text-white" : "text-black"
                  } text-3xl sm:text-4xl font-bold  tracking-tight`}
                >
                  Watch History
                </h1>
                <p className="text-gray-400 mt-1">
                  {filteredHistory.length} of {watchHistory.length} videos
                </p>
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              disabled={actionLoading || watchHistory.length === 0}
              className={`flex items-center gap-2 border px-6 py-3 rounded-xl transition-all duration-200 font-medium backdrop-blur-sm ${
                isDarkMode
                  ? "bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-700/30 text-red-400 disabled:text-gray-500 border-red-500/30 disabled:border-gray-600/30"
                  : "bg-transparent hover:bg-red-100 disabled:bg-gray-100 text-red-600 disabled:text-gray-400 border-red-200 disabled:border-gray-300"
              } disabled:cursor-not-allowed`}
            >
              <Trash2 size={18} />
              {actionLoading ? "Clearing..." : "Clear All"}
            </button>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
                size={20}
              />
              <input
                type="text"
                placeholder="Search videos, creators, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-sm ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700/50 text-gray-100 placeholder-gray-400"
                    : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {/* View Toggle */}
              <div
                className={`flex rounded-xl p-1 ${
                  isDarkMode
                    ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50"
                    : "bg-white/50 backdrop-blur-sm border border-gray-200"
                }`}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white shadow-lg"
                      : isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white shadow-lg"
                      : isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
              }`}
            >
              <Clock
                className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                size={40}
              />
            </div>
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDarkMode ? "text-gray-300" : "text-gray-800"
              }`}
            >
              {searchTerm ? "No videos found" : "No watch history yet"}
            </h2>
            <p
              className={`max-w-md mx-auto leading-relaxed ${
                isDarkMode ? "text-gray-500" : "text-gray-600"
              }`}
            >
              {searchTerm
                ? "Try adjusting your search terms or filters to find what you're looking for"
                : "Videos you watch will appear here. Start exploring to build your history!"}
            </p>
          </div>
        ) : (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }`}
          >
            {filteredHistory.map((video) => (
              <div
                key={video._id}
                className={`group relative backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  isDarkMode
                    ? "bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50"
                    : "bg-white/30 hover:bg-white/50 border-gray-200/30 hover:border-gray-300/50"
                } ${
                  viewMode === "grid"
                    ? "rounded-2xl overflow-hidden"
                    : "rounded-xl p-4 flex gap-4"
                }`}
              >
                {/* Remove button */}
                <button
                  onClick={(e) => handleRemoveFromHistory(video._id, e)}
                  disabled={actionLoading}
                  className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg"
                  title="Remove from history"
                >
                  <Trash2 size={14} />
                </button>

                {/* Thumbnail */}
                <div
                  className={`relative cursor-pointer ${
                    viewMode === "grid" ? "" : "flex-shrink-0 w-48 h-28"
                  }`}
                  onClick={() => handleVideoClick(video._id)}
                >
                  <img
                    src={video.thumbnail?.url || "/api/placeholder/400/300"}
                    alt={video.title}
                    className={`object-cover bg-gray-700 transition-transform duration-300 group-hover:scale-105 ${
                      viewMode === "grid"
                        ? "w-full h-48"
                        : "w-full sm:h-40 lg:h-full rounded-lg"
                    }`}
                    onError={(e) => {
                      e.target.src = "/api/placeholder/400/300";
                    }}
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                        <Play className="text-white fill-current" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`cursor-pointer flex-1 ${
                    viewMode === "grid" ? "p-5" : ""
                  }`}
                  onClick={() => handleVideoClick(video._id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={video.owner?.avatar}
                      alt={video.owner?.fullName}
                      className={`w-8 h-8 rounded-full border ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isDarkMode
                          ? "text-gray-300 hover:text-blue-400"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {video.owner?.fullName}
                    </span>
                  </div>

                  <h3
                    className={`font-semibold mb-3 line-clamp-2 transition-colors leading-tight ${
                      isDarkMode
                        ? "text-gray-100 hover:text-blue-400"
                        : "text-gray-800 hover:text-blue-600"
                    }`}
                  >
                    {video.title}
                  </h3>

                  {viewMode === "grid" && (
                    <p
                      className={`text-sm line-clamp-2 mb-4 leading-relaxed ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {video.description}
                    </p>
                  )}

                  <div
                    className={`flex items-center gap-4 text-xs ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      <span className="font-medium">
                        {formatViews(video.views)} views
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(video.createdAt)}</span>
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

export default History;
