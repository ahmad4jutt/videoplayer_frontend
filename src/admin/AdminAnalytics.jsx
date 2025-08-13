import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getSystemAnalytics, getAdminDashboard } from "../services/api";
import {
  Users,
  Video,
  MessageCircle,
  Heart,
  TrendingUp,
  Calendar,
  BarChart3,
  Eye,
  Activity,
  Download,
  Filter,
  RefreshCw,
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
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { useAuth } from "../hooks/UseAuth";

const AdminAnalytics = () => {
  const { isDarkMode } = useTheme();
  const { adminToken } = useAuth();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, dashboardResponse] = await Promise.all([
        getSystemAnalytics(adminToken, selectedPeriod),
        getAdminDashboard(adminToken),
      ]);

      setAnalyticsData(analyticsResponse.data.data);
      setDashboardData(dashboardResponse.data.data);
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  const AnalyticsCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      indigo: "bg-indigo-500",
    };

    const isPositive = change >= 0;

    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {title}
            </p>
            <p
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mt-2`}
            >
              {typeof value === "number" ? value.toLocaleString() : value || 0}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                <TrendingUp
                  className={`w-4 h-4 mr-1 ${
                    isPositive
                      ? "text-green-500 rotate-0"
                      : "text-red-500 rotate-180"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change}%
                </span>
                <span
                  className={`text-xs ml-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  vs last period
                </span>
              </div>
            )}
          </div>
          <div className={`${colorClasses[color]} p-4 rounded-full`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const UserEngagementChart = ({ userAnalytics, videoAnalytics }) => {
    const combinedData = {};

    userAnalytics?.forEach((item) => {
      combinedData[item._id] = {
        date: item._id,
        newUsers: item.newUsers || 0,
        activeUsers: item.activeUsers || 0,
        newVideos: 0,
        totalViews: 0,
      };
    });

    videoAnalytics?.forEach((item) => {
      if (combinedData[item._id]) {
        combinedData[item._id].newVideos = item.newVideos || 0;
        combinedData[item._id].totalViews = item.totalViews || 0;
      } else {
        combinedData[item._id] = {
          date: item._id,
          newUsers: 0,
          activeUsers: 0,
          newVideos: item.newVideos || 0,
          totalViews: item.totalViews || 0,
        };
      }
    });

    const chartData = Object.values(combinedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <h3
          className={`text-xl font-semibold mb-6 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          User Engagement Over Time
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
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
                borderRadius: "8px",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              fill="#3b82f6"
              fillOpacity={0.3}
              stroke="#3b82f6"
              strokeWidth={2}
              name="Active Users"
            />
            <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
            <Line
              type="monotone"
              dataKey="newVideos"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
              name="New Videos"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const ContentAnalyticsChart = ({ data }) => {
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <h3
          className={`text-xl font-semibold mb-6 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Content Distribution
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                    border: isDarkMode
                      ? "1px solid #374151"
                      : "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: isDarkMode ? "#ffffff" : "#000000",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {data?.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const PerformanceMetrics = ({ analyticsData, dashboardData }) => {
    // Calculate user retention rate based on active vs total users
    const calculateUserRetention = () => {
      if (!dashboardData?.overview) return { value: "0%", change: 0 };

      const totalUsers = dashboardData.overview.totalUsers || 0;
      const activeUsers = dashboardData.overview.activeUsers || 0;

      if (totalUsers === 0) return { value: "0%", change: 0 };

      const retentionRate = ((activeUsers / totalUsers) * 100).toFixed(1);

      // Calculate change based on previous period data if available
      const previousRetention =
        dashboardData.overview.previousRetention || retentionRate;
      const change = (
        ((retentionRate - previousRetention) / previousRetention) *
        100
      ).toFixed(1);

      return {
        value: `${retentionRate}%`,
        change: parseFloat(change),
      };
    };

    // Calculate average session duration from analytics data
    const calculateAvgSessionDuration = () => {
      if (
        !analyticsData?.userAnalytics ||
        analyticsData.userAnalytics.length === 0
      ) {
        return { value: "0m 0s", change: 0 };
      }

      // Sum up session durations and divide by number of sessions
      const totalDuration = analyticsData.userAnalytics.reduce((sum, item) => {
        return sum + (item.avgSessionDuration || 0);
      }, 0);

      const avgDurationMinutes =
        totalDuration / analyticsData.userAnalytics.length;
      const minutes = Math.floor(avgDurationMinutes);
      const seconds = Math.floor((avgDurationMinutes - minutes) * 60);

      // Calculate change (you might want to compare with previous period data)
      const previousAvgDuration =
        analyticsData.previousAvgSessionDuration || avgDurationMinutes;
      const change =
        previousAvgDuration > 0
          ? (
              ((avgDurationMinutes - previousAvgDuration) /
                previousAvgDuration) *
              100
            ).toFixed(1)
          : 0;

      return {
        value: `${minutes}m ${seconds}s`,
        change: parseFloat(change),
      };
    };

    // Calculate content upload rate from video analytics
    const calculateContentUploadRate = () => {
      if (
        !analyticsData?.videoAnalytics ||
        analyticsData.videoAnalytics.length === 0
      ) {
        return { value: "0/day", change: 0 };
      }

      // Calculate average videos uploaded per day
      const totalVideos = analyticsData.videoAnalytics.reduce((sum, item) => {
        return sum + (item.newVideos || 0);
      }, 0);

      const totalDays = analyticsData.videoAnalytics.length;
      const videosPerDay =
        totalDays > 0 ? Math.round(totalVideos / totalDays) : 0;

      // Calculate change compared to previous period
      const previousUploadRate =
        analyticsData.previousUploadRate || videosPerDay;
      const change =
        previousUploadRate > 0
          ? (
              ((videosPerDay - previousUploadRate) / previousUploadRate) *
              100
            ).toFixed(1)
          : 0;

      return {
        value: `${videosPerDay}/day`,
        change: parseFloat(change),
      };
    };

    // Calculate engagement rate from likes, comments, and views
    const calculateEngagementRate = () => {
      if (!dashboardData?.overview) return { value: "0%", change: 0 };

      const totalLikes = dashboardData.overview.totalLikes || 0;
      const totalComments = dashboardData.overview.totalComments || 0;
      const totalViews = dashboardData.overview.totalViews || 0;

      if (totalViews === 0) return { value: "0%", change: 0 };

      const engagementRate = (
        ((totalLikes + totalComments) / totalViews) *
        100
      ).toFixed(1);

      // Calculate change
      const previousEngagement =
        dashboardData.overview.previousEngagement || engagementRate;
      const change =
        previousEngagement > 0
          ? (
              ((engagementRate - previousEngagement) / previousEngagement) *
              100
            ).toFixed(1)
          : 0;

      return {
        value: `${engagementRate}%`,
        change: parseFloat(change),
      };
    };

    const metricsData = [
      {
        name: "User Retention",
        ...calculateUserRetention(),
        color: "green",
        icon: Users,
      },
      {
        name: "Avg. Session Duration",
        ...calculateAvgSessionDuration(),
        color: "orange",
        icon: Activity,
      },
      {
        name: "Content Upload Rate",
        ...calculateContentUploadRate(),
        color: "blue",
        icon: Video,
      },
      {
        name: "Engagement Rate",
        ...calculateEngagementRate(),
        color: "purple",
        icon: Heart,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsData.map((metric, index) => (
          <AnalyticsCard
            key={index}
            title={metric.name}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>
    );
  };

  const TopPerformersTable = ({ users }) => {
    return (
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } p-6 rounded-lg border shadow-sm`}
      >
        <h3
          className={`text-xl font-semibold mb-6 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Top Content Creators
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Creator
                </th>
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Videos
                </th>
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  CreatedAt
                </th>
                <th
                  className={`text-left py-3 px-4 font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.slice(0, 10).map((user, index) => (
                <tr
                  key={user._id}
                  className={`border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  } hover:${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p
                          className={`font-medium ${
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
                    </div>
                  </td>
                  <td
                    className={`py-4 px-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {user.videoCount}
                  </td>
                  <td
                    className={`py-4 px-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {user.createdAt || 0}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive
                          ? isDarkMode
                            ? "bg-green-900 text-green-200"
                            : "bg-green-100 text-green-800"
                          : isDarkMode
                          ? "bg-red-900 text-red-200"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive === true ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Loading analytics...
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
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchAllData();
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const contentDistribution = [
    { name: "Videos", value: dashboardData?.overview?.totalVideos || 0 },
    { name: "Comments", value: dashboardData?.overview?.totalComments || 0 },
    { name: "Likes", value: dashboardData?.overview?.totalLikes || 0 },
    {
      name: "Subscriptions",
      value: dashboardData?.overview?.totalSubscriptions || 0,
    },
  ];

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Analytics Dashboard
            </h1>
            <p
              className={`mt-2 text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Comprehensive insights into your platform's performance
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 rounded-lg border text-sm flex items-center space-x-2 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Performance Metrics */}

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* User Engagement Chart - Takes 2 columns */}
          <div className="xl:col-span-2">
            <UserEngagementChart
              userAnalytics={analyticsData?.userAnalytics}
              videoAnalytics={analyticsData?.videoAnalytics}
            />
          </div>

          {/* Content Distribution - Takes 1 column */}
          <div className="xl:col-span-1">
            <ContentAnalyticsChart data={contentDistribution} />
          </div>
        </div>

        {/* Top Performers Table */}
        <TopPerformersTable users={dashboardData?.mostActiveUsers} />
      </div>
    </div>
  );
};

export default AdminAnalytics;
