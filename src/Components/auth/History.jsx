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
  ArrowLeft,
  X,
  MoreVertical,
  Share2,
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
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [watchHistory, searchTerm, activeTab]);

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

  const filterHistory = () => {
    let filtered = [...watchHistory];

    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === "videos") {
      // Filter for videos only (assuming duration > 60 seconds)
      filtered = filtered.filter((video) => video.duration > 60);
    } else if (activeTab === "shorts") {
      // Filter for shorts (assuming duration <= 60 seconds)
      filtered = filtered.filter((video) => video.duration <= 60);
    }

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

  const isToday = (dateString) => {
    const today = new Date();
    const videoDate = new Date(dateString);
    return today.toDateString() === videoDate.toDateString();
  };

  const isYesterday = (dateString) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const videoDate = new Date(dateString);
    return yesterday.toDateString() === videoDate.toDateString();
  };

  const groupVideosByDate = (videos) => {
    const today = [];
    const yesterday = [];
    const older = [];

    videos.forEach((video) => {
      const watchTimestamp = video.watchedAt || video.updatedAt;
      if (isToday(watchTimestamp)) {
        today.push(video);
      } else if (isYesterday(watchTimestamp)) {
        yesterday.push(video);
      } else {
        older.push(video);
      }
    });

    return { today, yesterday, older };
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
        toast.success("Watch history cleared successfully");
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
    try {
      setActionLoading(true);
      await removeFromWatchHistory(videoId, token);
      const updatedHistory = watchHistory.filter(
        (video) => video._id !== videoId
      );
      setWatchHistory(updatedHistory);
      setError(null);
      toast.success("Video removed from history");
    } catch (err) {
      setError("Failed to remove video from history. Please try again.");
      console.error("Error removing video from history:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const handleShare = (video, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: video.title,
        url: `${window.location.origin}/video/${video._id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/video/${video._id}`
      );
      toast.success("Link copied to clipboard");
    }
    setShowMoreMenu(null);
  };

  const VideoCard = ({ video }) => (
    <div
      className="group flex gap-4 py-2 cursor-pointer relative"
      onClick={() => handleVideoClick(video._id)}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="w-40 h-24 object-cover rounded-lg bg-gray-200"
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-transparent bg-opacity-70 rounded-full p-2">
              <Play className="text-white fill-current" size={16} />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="absolute bottom-1 right-0 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium text-sm line-clamp-2 mb-1 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {video.title}
        </h3>

        <p
          className={`text-xs mb-1 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {video.owner?.fullName}
        </p>

        <p
          className={`text-xs mb-2 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {formatViews(video.views)} views
        </p>

        <p
          className={`text-xs line-clamp-2 ${
            isDarkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {video.description}
        </p>
      </div>

      {/* More Menu */}
      <div className="relative">
        {/* Remove Button */}
        <button
          onClick={(e) => handleRemoveFromHistory(video._id, e)}
          className={`absolute left-1 top-7 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
            isDarkMode
              ? "text-gray-400 hover:text-white hover:bg-gray-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="Remove from Watch history"
        >
          <X size={16} />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMoreMenu(showMoreMenu === video._id ? null : video._id);
          }}
          className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
            isDarkMode
              ? "text-gray-400 hover:text-white hover:bg-gray-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <MoreVertical size={16} />
        </button>

        {showMoreMenu === video._id && (
          <div
            className={`absolute right-0 top-8 w-48 rounded-lg shadow-lg border z-20 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <button
              onClick={(e) => handleShare(video, e)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-opacity-50 ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
      >
        <div className="flex">
          {/* Left Section Skeleton */}
          <div className="w-full lg:w-[55%] p-6">
            <div
              className={`w-48 h-8 rounded animate-pulse mb-6 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex gap-8 mb-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-16 h-6 rounded animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className={`w-40 h-24 rounded animate-pulse ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <div
                      className={`w-3/4 h-4 rounded animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`w-1/2 h-3 rounded animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`w-1/4 h-3 rounded animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section Skeleton */}
          <div
            className={`hidden lg:block w-[45%] fixed right-0 top-0 h-screen border-l ${
              isDarkMode
                ? "border-gray-700 bg-gray-900"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="p-6">
              <div
                className={`w-full h-10 rounded animate-pulse mb-6 pb-4 border-b ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-700"
                    : "bg-gray-200 border-gray-200"
                }`}
              ></div>
              <div
                className={`w-32 h-6 rounded animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center">
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Something went wrong
          </h2>
          <p
            className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {error}
          </p>
          <button
            onClick={fetchWatchHistory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { today, yesterday, older } = groupVideosByDate(filteredHistory);
  // desktop
  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
      onClick={() => setShowMoreMenu(null)}
    >
      {/* Header */}
      <h1
        className={`text-2xl pt-6 pr-8 pl-8 lg:text-3xl font-bold font-sans  ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Watch history
      </h1>
      <div className="flex flex-col-reverse lg:flex-row min-h-screen">
        {/* Left Section - 55% */}
        <div className="w-full lg:w-[55%] lg:overflow-y-auto scrollbar-hide lg:max-h-screen">
          <div className="p-4 lg:p-6 lg:pl-12 pb-20 lg:pb-6">
            {/* Tabs */}
            <div className="flex gap-6 lg:gap-8 mb-8 border-b border-gray-200 dark:border-gray-700">
              {[
                { key: "all", label: "All" },
                { key: "videos", label: "Videos" },
                { key: "shorts", label: "Shorts" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? isDarkMode
                        ? "text-white border-white"
                        : "text-gray-900 border-gray-900"
                      : isDarkMode
                      ? "text-gray-400 border-transparent hover:text-gray-300"
                      : "text-gray-600 border-transparent hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="pl-6">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-20">
                  <Clock
                    className={`mx-auto mb-4 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                    size={48}
                  />
                  <h2
                    className={`text-xl font-medium mb-2 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {searchTerm ? "No videos found" : "No watch history yet"}
                  </h2>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Videos you watch will appear here"}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Today */}
                  {today.length > 0 && (
                    <div>
                      <h2
                        className={`text-lg font-medium mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Today
                      </h2>
                      <div className="space-y-2">
                        {today.map((video) => (
                          <VideoCard key={video._id} video={video} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yesterday */}
                  {yesterday.length > 0 && (
                    <div>
                      <h2
                        className={`text-lg font-medium mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Yesterday
                      </h2>
                      <div className="space-y-2">
                        {yesterday.map((video) => (
                          <VideoCard key={video._id} video={video} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Older */}
                  {older.length > 0 && (
                    <div>
                      <h2
                        className={`text-lg font-medium mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Older
                      </h2>
                      <div className="space-y-2">
                        {older.map((video) => (
                          <VideoCard key={video._id} video={video} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - 45% */}
        <div
          className={`w-full lg:w-[35%] lg:fixed lg:right-0 lg:top-30 lg:h-screen  lg:border-l ${
            isDarkMode
              ? "border-gray-700 bg-gray-900"
              : "border-gray-200 bg-white"
          } lg:overflow-hidden`}
        >
          <div className="p-4 lg:p-6 h-full flex flex-col">
            {/* Search */}
            <div
              className={`relative mb-6 pb-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <Search
                className={`absolute left-3 top-5 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder="Search watch history"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-sm ${
                  isDarkMode
                    ? "text-white placeholder-gray-400"
                    : "text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Clear History */}
            <div className="flex-shrink-0">
              <button
                onClick={handleClearHistory}
                disabled={actionLoading || watchHistory.length === 0}
                className={`flex items-center gap-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                <Trash2 size={16} />
                {actionLoading ? "Clearing..." : "Clear all watch history"}
              </button>
            </div>

            {/* Additional content area for future features */}
            <div className="flex-1 mt-6 hidden lg:block">
              <div
                className={`text-center py-8 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <p className="text-sm">
                  Search your watch history or clear it completely
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
