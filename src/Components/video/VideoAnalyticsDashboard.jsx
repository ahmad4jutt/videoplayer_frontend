import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Eye,
  Users,
  UserCheck,
  UserX,
  Calendar,
  TrendingUp,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getVideoAnalytics } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useParams, useNavigate } from "react-router-dom";

const VideoAnalyticsDashBoard = ({ videoId: propVideoId, onBack }) => {
  // Use videoId from props if provided, otherwise from URL params
  const { videoId: paramVideoId } = useParams();
  const videoId = propVideoId || paramVideoId;

  const navigate = useNavigate();
  const { token } = useAuth();
  const { isDarkMode } = useTheme();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await getVideoAnalytics(token, videoId, selectedDays);
      setAnalytics(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchAnalytics();
    }
  }, [videoId, selectedDays]);

  const handleDaysChange = (days) => {
    setSelectedDays(days);
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleBackClick = () => {
    if (onBack) {
      // If onBack prop is provided (called from dashboard), use it
      onBack();
    } else {
      // Otherwise use browser navigation
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center px-4`}
      >
        <div className="flex items-center space-x-2">
          <RefreshCw
            className={`w-6 h-6 animate-spin ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <span
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } text-sm sm:text-base`}
          >
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center px-4`}
      >
        <div
          className={`text-center p-4 sm:p-8 rounded-lg max-w-md w-full ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border`}
        >
          <div className={`text-red-500 text-lg sm:text-xl mb-4`}>Error</div>
          <p
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } text-sm sm:text-base mb-4`}
          >
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white transition-colors text-sm sm:text-base`}
            >
              Try Again
            </button>
            <button
              onClick={handleBackClick}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-500 hover:bg-gray-600"
              } text-white transition-colors text-sm sm:text-base`}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { video, dailyStats, summary } = analytics;

  // Prepare data for charts
  const viewerTypeData = [
    {
      name: "Registered Users",
      value: video.registeredUserViews,
      color: "#3B82F6",
    },
    { name: "Anonymous Users", value: video.anonymousViews, color: "#10B981" },
  ];

  const statsCards = [
    {
      title: "Total Views",
      value: video.totalViews,
      icon: Eye,
      color: "blue",
    },
    {
      title: "Unique Views",
      value: video.totalUniqueViews,
      icon: Users,
      color: "green",
    },
    {
      title: "Registered Views",
      value: video.registeredUserViews,
      icon: UserCheck,
      color: "purple",
    },
    {
      title: "Anonymous Views",
      value: video.anonymousViews,
      icon: UserX,
      color: "orange",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: isDarkMode
        ? "bg-blue-900 border-blue-700"
        : "bg-blue-50 border-blue-200",
      green: isDarkMode
        ? "bg-green-900 border-green-700"
        : "bg-green-50 border-green-200",
      purple: isDarkMode
        ? "bg-purple-900 border-purple-700"
        : "bg-purple-50 border-purple-200",
      orange: isDarkMode
        ? "bg-orange-900 border-orange-700"
        : "bg-orange-50 border-orange-200",
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: isDarkMode ? "text-blue-400" : "text-blue-600",
      green: isDarkMode ? "text-green-400" : "text-green-600",
      purple: isDarkMode ? "text-purple-400" : "text-purple-600",
      orange: isDarkMode ? "text-orange-400" : "text-orange-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } p-3 sm:p-4 lg:p-6`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={handleBackClick}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              } border ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              } transition-colors`}
            >
              <ArrowLeft
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              />
            </button>
            <div className="min-w-0 flex-1">
              <h1
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } truncate`}
              >
                Video Analytics
              </h1>
              <p
                className={`text-sm sm:text-base flex gap-2 lg:text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                } mt-1 truncate`}
              >
                <p className="font-semibold">video title</p> {video.title}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4">
            <button
              onClick={handleRefresh}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`p-3 sm:p-4 lg:p-6 rounded-xl border ${getColorClasses(
                  stat.color
                )} ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      } truncate`}
                    >
                      {stat.title}
                    </p>
                    <p
                      className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } mt-1`}
                    >
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <Icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${getIconColor(
                      stat.color
                    )} flex-shrink-0`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Daily Views Chart */}
          <div
            className={`p-4 sm:p-6 rounded-xl ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border`}
          >
            <h3
              className={`text-base sm:text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              Daily Views Trend
            </h3>
            {dailyStats.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={250}
                className="sm:h-[300px]"
              >
                <LineChart data={dailyStats}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                    fontSize={10}
                    className="sm:text-xs"
                  />
                  <YAxis
                    stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                    fontSize={10}
                    className="sm:text-xs"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
                      borderRadius: "8px",
                      color: isDarkMode ? "#FFFFFF" : "#000000",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: "#3B82F6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className={`h-[250px] sm:h-[300px] flex items-center justify-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div className="text-center">
                  <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">
                    No daily statistics available
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Viewer Type Distribution */}
          <div
            className={`p-4 sm:p-6 rounded-xl ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border`}
          >
            <h3
              className={`text-base sm:text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              Viewer Distribution
            </h3>
            {video.totalViews > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={250}
                className="sm:h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={viewerTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                    style={{
                      fontSize: window.innerWidth < 640 ? "10px" : "12px",
                    }}
                  >
                    {viewerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
                      borderRadius: "8px",
                      color: isDarkMode ? "#FFFFFF" : "#000000",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className={`h-[250px] sm:h-[300px] flex items-center justify-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div className="text-center">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm sm:text-base">
                    No viewer data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div
          className={`p-4 sm:p-6 rounded-xl ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border`}
        >
          <h3
            className={`text-base sm:text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Analytics Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Analysis Period
              </p>
              <p
                className={`text-sm sm:text-base lg:text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mt-1`}
              >
                {summary.period}
              </p>
            </div>
            <div>
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Days with Data
              </p>
              <p
                className={`text-sm sm:text-base lg:text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mt-1`}
              >
                {summary.totalDays} days
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Peak Day Views
              </p>
              <p
                className={`text-sm sm:text-base lg:text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mt-1`}
              >
                {summary.peakDay ? `${summary.peakDay.views} views` : "No data"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalyticsDashBoard;
