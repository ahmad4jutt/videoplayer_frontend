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
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";

import {
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
} from "../../services/api";
const History = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [filteredHistory, setFilterdHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [actionLoading, setActionLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
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
    setFilterdHistory(filtered);
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
        setFilterdHistory([]);
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
      } catch (err) {
        setError("Failed to remove video from history. Please try again.");
        console.error("Error removing video from history:", err);
      } finally {
        setActionLoading(false);
      }
    }
  };
  const handleVideoClick = (videoId) => {
    // Navigate to video player page
    navigate(`/video/${videoId}`);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchWatchHistory}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-500" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">
                Watch History
              </h1>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={actionLoading || watchHistory.length === 0}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              {actionLoading ? "Clearing..." : "Clear All"}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search videos or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="text-gray-600">
            Showing {filteredHistory.length} of {watchHistory.length} videos
          </div>
        </div>

        {/* Video Grid */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              {searchTerm ? "No videos found" : "No watch history yet"}
            </h2>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Videos you watch will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHistory.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group relative"
              >
                {/* Remove button - Positioned relative to the card */}
                <button
                  onClick={(e) => handleRemoveFromHistory(video._id, e)}
                  disabled={actionLoading}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  title="Remove from history"
                >
                  <Trash2 size={12} />
                </button>

                {/* Thumbnail - Clickable area for video */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => handleVideoClick(video._id)}
                >
                  <img
                    src={video.thumbnail.url || "/api/placeholder/400/300"}
                    alt={video.title}
                    className="w-full h-48 object-cover bg-gray-200 transition-transform group-hover:scale-105"
                    onError={(e) => {
                      console.log("Thumbnail failed to load:", video.thumbnail);
                      e.target.src = "/api/placeholder/400/300";
                    }}
                    onLoad={() => {
                      console.log(
                        "Thumbnail loaded successfully:",
                        video.thumbnail
                      );
                    }}
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play
                          className="text-blue-500 fill-current"
                          size={24}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Content - Also clickable for video */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => handleVideoClick(video._id)}
                >
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600">
                    {video.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.fullName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600 hover:text-blue-600">
                      {video.owner.fullName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye size={12} />
                      {formatViews(video.views)} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(video.createdAt)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {video.description}
                  </p>
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
