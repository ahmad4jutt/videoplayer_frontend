import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { getChannelStats } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { Eye, Users, Video, Heart } from "lucide-react";

export default function ChannelStats() {
  const { token } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getChannelStats(token)
      .then((res) => {
        console.log("📊 Channel Stats Response:", res.data);
        setStats(res.data?.data || {});
      })
      .catch((err) => {
        console.error("Failed to fetch channel stats:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div
        className={`rounded-lg p-6 shadow-sm ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="animate-pulse">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-20 rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>
          <div
            className={`h-64 rounded ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Views", value: stats.totalViews },
    { name: "Subscribers", value: stats.totalSubscribers },
    { name: "Videos", value: stats.totalVideos },
    { name: "Likes", value: stats.totalLikes },
  ];

  // Mock time series data for trend chart
  const trendData = [
    { month: "Jan", views: Math.floor(stats.totalViews * 0.6) },
    { month: "Feb", views: Math.floor(stats.totalViews * 0.7) },
    { month: "Mar", views: Math.floor(stats.totalViews * 0.8) },
    { month: "Apr", views: Math.floor(stats.totalViews * 0.9) },
    { month: "May", views: stats.totalViews },
  ];

  const statCards = [
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      color: isDarkMode ? "text-blue-400" : "text-blue-600",
      bg: isDarkMode ? "bg-blue-900" : "bg-blue-50",
    },
    {
      title: "Subscribers",
      value: stats.totalSubscribers,
      icon: Users,
      color: isDarkMode ? "text-green-400" : "text-green-600",
      bg: isDarkMode ? "bg-green-900" : "bg-green-50",
    },
    {
      title: "Videos",
      value: stats.totalVideos,
      icon: Video,
      color: isDarkMode ? "text-purple-400" : "text-purple-600",
      bg: isDarkMode ? "bg-purple-900" : "bg-purple-50",
    },
    {
      title: "Likes",
      value: stats.totalLikes,
      icon: Heart,
      color: isDarkMode ? "text-red-400" : "text-red-600",
      bg: isDarkMode ? "bg-red-900" : "bg-red-50",
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-lg shadow-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span style={{ color: payload[0].color }}>
              {payload[0].name}: {payload[0].value?.toLocaleString()}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-sm border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {card.title}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <IconComponent className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div
          className={`p-6 rounded-lg shadow-sm border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#374151" : "#f1f5f9"}
              />
              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? "#9CA3AF" : "#6B7280",
                }}
                axisLine={{ stroke: isDarkMode ? "#4B5563" : "#E5E7EB" }}
              />
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? "#9CA3AF" : "#6B7280",
                }}
                axisLine={{ stroke: isDarkMode ? "#4B5563" : "#E5E7EB" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={isDarkMode ? "#60A5FA" : "#3b82f6"}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Chart */}
        <div
          className={`p-6 rounded-lg shadow-sm border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Views Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? "#374151" : "#f1f5f9"}
              />
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? "#9CA3AF" : "#6B7280",
                }}
                axisLine={{ stroke: isDarkMode ? "#4B5563" : "#E5E7EB" }}
              />
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? "#9CA3AF" : "#6B7280",
                }}
                axisLine={{ stroke: isDarkMode ? "#4B5563" : "#E5E7EB" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                stroke={isDarkMode ? "#60A5FA" : "#3b82f6"}
                fill={isDarkMode ? "#60A5FA" : "#3b82f6"}
                fillOpacity={isDarkMode ? 0.2 : 0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
