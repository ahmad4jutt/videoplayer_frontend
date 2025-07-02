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
import { Eye, Users, Video, Heart } from "lucide-react";

export default function ChannelStats() {
  const { token } = useAuth();
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
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Subscribers",
      value: stats.totalSubscribers,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Videos",
      value: stats.totalVideos,
      icon: Video,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Likes",
      value: stats.totalLikes,
      icon: Heart,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Views Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
