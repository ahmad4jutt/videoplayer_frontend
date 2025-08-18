import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Eye,
  TrendingUp,
  BarChart3,
  Play,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";
import ChannelStats from "./Channelstat";
import VideoStats from "./VideoStats";
import VideoAnalyticsDashBoard from "../video/VideoAnalyticsDashboard";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { getUserChannelVideos } from "../../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const { isDarkMode } = useTheme();
  const [showVideoAnalytics, setShowVideoAnalytics] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's videos on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      if (!currentUser?._id || !token) return;

      try {
        setLoading(true);
        const response = await getUserChannelVideos(token, currentUser._id);
        setVideos(response.data.data.videos || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentUser, token]);

  const handleVideoAnalyticsView = (videoId) => {
    setSelectedVideoId(videoId);
    setShowVideoAnalytics(true);
  };
  const handleBack = () => {
    navigate(-1);
  };
  const handleBackToDashboard = () => {
    setShowVideoAnalytics(false);
    setSelectedVideoId(null);
  };

  // Helper function to format duration
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // If showing video analytics, render that component
  if (showVideoAnalytics && selectedVideoId) {
    return (
      <VideoAnalyticsDashBoard
        videoId={selectedVideoId}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div
      className={`min-h-screen p-3 sm:p-4 md:p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
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
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section - More compact on mobile */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1
            className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Dashboard
          </h1>
          <p
            className={`text-sm sm:text-base ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Overview of your channel performance
          </p>
        </div>

        {/* Quick Actions Section - Better mobile layout */}
        <div
          className={`rounded-lg shadow-sm border p-4 sm:p-6 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* My Subscribers Link */}
            <Link
              to={`/subscribers/${currentUser?.channelId || currentUser?._id}`}
              className={`group flex items-center p-3 sm:p-4 border rounded-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-blue-900 group-hover:bg-blue-800"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <Users
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <p
                  className={`text-xs sm:text-sm font-medium truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  My Subscribers
                </p>
                <p
                  className={`text-xs hidden sm:block ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  View who follows your channel
                </p>
              </div>
            </Link>

            {/* Subscribed Channels Link */}
            <Link
              to="/subscribed-channels"
              className={`group flex items-center p-3 sm:p-4 border rounded-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-green-900 group-hover:bg-green-800"
                    : "bg-green-100 group-hover:bg-green-200"
                }`}
              >
                <UserPlus
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <p
                  className={`text-xs sm:text-sm font-medium truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Subscribed Channels
                </p>
                <p
                  className={`text-xs hidden sm:block ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Channels you're following
                </p>
              </div>
            </Link>

            {/* Channel Analytics Link */}
            <Link
              to={`/channel/${currentUser?.channelId || currentUser?._id}`}
              className={`group flex items-center p-3 sm:p-4 border rounded-lg transition-colors sm:col-span-2 lg:col-span-1 ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-purple-900 group-hover:bg-purple-800"
                    : "bg-purple-100 group-hover:bg-purple-200"
                }`}
              >
                <Eye
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </div>
              <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                <p
                  className={`text-xs sm:text-sm font-medium truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  View Channel
                </p>
                <p
                  className={`text-xs hidden sm:block ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  See your public channel
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Your Videos Section - Enhanced mobile responsiveness */}
        <div
          className={`rounded-lg shadow-sm border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2
              className={`text-base sm:text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Your Videos - Click for Analytics
            </h2>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Click on any video to view detailed analytics
            </p>
          </div>

          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                <span
                  className={`ml-2 text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Loading videos...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 text-sm sm:text-base">{error}</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <p
                  className={`text-sm sm:text-base ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No videos found. Upload your first video to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    onClick={() => handleVideoAnalyticsView(video._id)}
                    className={`group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border ${
                      isDarkMode
                        ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail?.url}
                        alt={video.title}
                        className="w-full h-full  object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-white bg-opacity-90 rounded-full p-2 sm:p-3">
                            <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-gray-800" />
                          </div>
                        </div>
                      </div>
                      {/* Duration Badge */}
                      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-3 sm:p-4">
                      <h3
                        className={`font-medium text-xs sm:text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {video.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="truncate">{video.views} views</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">
                            {formatDate(video.createdAt)}
                          </span>
                          <span className="sm:hidden">
                            {new Date(video.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2 sm:mb-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full truncate max-w-20 sm:max-w-none ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {video.category}
                        </span>
                        <span
                          className={`text-xs ${
                            video.isPublished
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {video.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      {/* Click to view analytics hint */}
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-center text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          <span>Click for analytics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Components - Stack on mobile */}
        <div className="space-y-4 sm:space-y-6">
          <VideoStats onVideoAnalytics={handleVideoAnalyticsView} />
          <ChannelStats />
        </div>
      </div>
    </div>
  );
}
