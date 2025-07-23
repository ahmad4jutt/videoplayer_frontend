import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getAdminDashboard, getSystemAnalytics } from "../services/api";
import {
  Users,
  Video,
  MessageCircle,
  Heart,
  UserPlus,
  TrendingUp,
  Calendar,
  BarChart3,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../hooks/UseAuth";
const AdminDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock token - replace with actual token from your auth system
  const { adminToken } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard(adminToken);
      setDashboardData(response.data.data);
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await getSystemAnalytics(adminToken, selectedPeriod);
      setAnalyticsData(response.data.data);
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error(err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      indigo: "bg-indigo-500",
    };

    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {title}
            </p>
            <p
              className={`text-2xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {value?.toLocaleString() || 0}
            </p>
            {trend && (
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />+{trend} this week
              </p>
            )}
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-full`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const UserActivityChart = ({ data }) => {
    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          User Registration Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? "#374151" : "#e5e7eb"}
            />
            <XAxis
              dataKey="_id"
              stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
              fontSize={12}
            />
            <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                borderRadius: "6px",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const AnalyticsChart = ({ userAnalytics, videoAnalytics }) => {
    // Combine user and video analytics data
    const combinedData = {};

    userAnalytics?.forEach((item) => {
      combinedData[item._id] = {
        date: item._id,
        newUsers: item.newUsers,
        newVideos: 0,
      };
    });

    videoAnalytics?.forEach((item) => {
      if (combinedData[item._id]) {
        combinedData[item._id].newVideos = item.newVideos;
      } else {
        combinedData[item._id] = {
          date: item._id,
          newUsers: 0,
          newVideos: item.newVideos,
        };
      }
    });

    const chartData = Object.values(combinedData);

    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            System Analytics
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-3 py-1 rounded-md border text-sm ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? "#374151" : "#e5e7eb"}
            />
            <XAxis
              dataKey="date"
              stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
              fontSize={12}
            />
            <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                borderRadius: "6px",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            />
            <Bar dataKey="newUsers" fill="#3b82f6" name="New Users" />
            <Bar dataKey="newVideos" fill="#10b981" name="New Videos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const MostActiveUsers = ({ users }) => {
    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Most Active Users
        </h3>
        <div className="space-y-4">
          {users?.slice(0, 5).map((user, index) => (
            <div key={user._id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user.fullName}
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  @{user.userName}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    isDarkMode
                      ? "bg-blue-900 text-blue-200"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.videoCount} videos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchDashboardData();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Dashboard
            </h1>
            <p
              className={`mt-1 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>
          {/* <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-md border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
          >
            {isDarkMode ? "☀️" : "🌙"} Toggle Theme
          </button> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={dashboardData?.overview?.totalUsers}
            icon={Users}
            trend={dashboardData?.overview?.recentUsers}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={dashboardData?.overview?.totalActiveUsers}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Total Videos"
            value={dashboardData?.overview?.totalVideos}
            icon={Video}
            trend={dashboardData?.overview?.recentVideos}
            color="purple"
          />
          <StatCard
            title="Total Comments"
            value={dashboardData?.overview?.totalComments}
            icon={MessageCircle}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Likes"
            value={dashboardData?.overview?.totalLikes}
            icon={Heart}
            color="red"
          />
          <StatCard
            title="Subscriptions"
            value={dashboardData?.overview?.totalSubscriptions}
            icon={UserPlus}
            color="indigo"
          />
          <StatCard
            title="Deactivated Users"
            value={dashboardData?.overview?.totalDeactivatedUsers}
            icon={UserX}
            color="red"
          />
          <StatCard
            title="Recent Users (7d)"
            value={dashboardData?.overview?.recentUsers}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UserActivityChart
            data={dashboardData?.trends?.userRegistrationTrend}
          />
          <AnalyticsChart
            userAnalytics={analyticsData?.userAnalytics}
            videoAnalytics={analyticsData?.videoAnalytics}
          />
        </div>

        {/* Most Active Users */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <MostActiveUsers users={dashboardData?.mostActiveUsers} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
