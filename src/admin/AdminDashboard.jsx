import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  getAdminDashboard,
  getSystemAnalytics,
  getHealthStatus,
} from "../services/api";
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
  const { isDarkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
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

  const fetchHealthStatus = async () => {
    try {
      setHealthLoading(true);
      const response = await getHealthStatus();
      setHealthStatus(response.data.data);
    } catch (err) {
      console.error("Health check failed:", err);
      setHealthStatus({
        status: "ERROR",
        serverTime: new Date().toISOString(),
      });
    } finally {
      setHealthLoading(false);
    }
  };
  useEffect(() => {
    fetchHealthStatus();
    // Optional: Set up periodic health checks every 30 seconds
    const healthInterval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(healthInterval);
  }, []);
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
    // Check if data exists and has items
    if (!data || data.length === 0) {
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
          <div className="flex items-center justify-center h-72">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No user registration data available
            </p>
          </div>
        </div>
      );
    }

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
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 25,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#374151" : "#e5e7eb"}
              />
              <XAxis
                dataKey="_id"
                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                fontSize={12}
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                fontSize={12}
                tick={{ fontSize: 11 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  border: isDarkMode
                    ? "1px solid #374151"
                    : "1px solid #e5e7eb",
                  borderRadius: "6px",
                  color: isDarkMode ? "#ffffff" : "#000000",
                  fontSize: "12px",
                }}
                labelStyle={{
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const AnalyticsChart = ({ userAnalytics, videoAnalytics }) => {
    // Combine user and video analytics data
    const combinedData = {};

    userAnalytics?.forEach((item) => {
      combinedData[item._id] = {
        date: item._id,
        newUsers: item.newUsers || 0,
        newVideos: 0,
      };
    });

    videoAnalytics?.forEach((item) => {
      if (combinedData[item._id]) {
        combinedData[item._id].newVideos = item.newVideos || 0;
      } else {
        combinedData[item._id] = {
          date: item._id,
          newUsers: 0,
          newVideos: item.newVideos || 0,
        };
      }
    });

    const chartData = Object.values(combinedData);

    // Check if we have data
    if (!chartData || chartData.length === 0) {
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
          <div className="flex items-center justify-center h-72">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No analytics data available for the selected period
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              New Users
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              New Videos
            </span>
          </div>
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 25,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#374151" : "#e5e7eb"}
              />
              <XAxis
                dataKey="date"
                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                fontSize={12}
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                fontSize={12}
                tick={{ fontSize: 11 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                  border: isDarkMode
                    ? "1px solid #374151"
                    : "1px solid #e5e7eb",
                  borderRadius: "6px",
                  color: isDarkMode ? "#ffffff" : "#000000",
                  fontSize: "12px",
                }}
                labelStyle={{
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              />
              <Bar
                dataKey="newUsers"
                fill="#3b82f6"
                name="New Users"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="newVideos"
                fill="#10b981"
                name="New Videos"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
        {!users || users.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No active users data available
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.slice(0, 5).map((user, index) => (
              <div key={user._id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.fullName}
                  </p>
                  <p
                    className={`text-sm truncate ${
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
                    {user.videoCount || 0} videos
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
  const HealthStatusCard = ({ healthData, loading }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "OK":
          return "green";
        case "ERROR":
          return "red";
        default:
          return "yellow";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "OK":
          return "🟢";
        case "ERROR":
          return "🔴";
        default:
          return "🟡";
      }
    };

    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            System Health
          </h3>
          <button
            onClick={fetchHealthStatus}
            disabled={loading}
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            } ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
            }`}
          >
            {loading ? "Checking..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : healthData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Status:
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {getStatusIcon(healthData.status)}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    healthData.status === "OK"
                      ? isDarkMode
                        ? "bg-green-900 text-green-200"
                        : "bg-green-100 text-green-800"
                      : isDarkMode
                      ? "bg-red-900 text-red-200"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {healthData.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Server Time:
              </span>
              <span
                className={`text-xs font-mono ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {new Date(healthData.serverTime).toLocaleString()}
              </span>
            </div>

            {healthData.environment && (
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Environment:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    healthData.environment === "production"
                      ? isDarkMode
                        ? "bg-blue-900 text-blue-200"
                        : "bg-blue-100 text-blue-800"
                      : isDarkMode
                      ? "bg-yellow-900 text-yellow-200"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {healthData.environment}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-16">
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Unable to fetch health status
            </span>
          </div>
        )}
      </div>
    );
  };
  return (
    <div
      className={`min-h-screen  ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <UserActivityChart
            data={dashboardData?.trends?.userRegistrationTrend}
          />
          <AnalyticsChart
            userAnalytics={analyticsData?.userAnalytics}
            videoAnalytics={analyticsData?.videoAnalytics}
          />
        </div>

        {/* Health Check and Most Active Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HealthStatusCard healthData={healthStatus} loading={healthLoading} />
          <div className="lg:col-span-2">
            <MostActiveUsers users={dashboardData?.mostActiveUsers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
