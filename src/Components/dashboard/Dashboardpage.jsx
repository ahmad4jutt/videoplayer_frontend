import React from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Eye, TrendingUp } from "lucide-react";
import ChannelStats from "./Channelstat";
import VideoStats from "./VideoStats";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Dashboard
          </h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Overview of your channel performance
          </p>
        </div>

        {/* Quick Actions Section */}
        <div
          className={`rounded-lg shadow-sm border p-6 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* My Subscribers Link */}
            <Link
              to={`/subscribers/${currentUser?.channelId || currentUser?._id}`}
              className={`group flex items-center p-4 border rounded-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-blue-900 group-hover:bg-blue-800"
                    : "bg-blue-100 group-hover:bg-blue-200"
                }`}
              >
                <Users
                  className={`h-5 w-5 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  My Subscribers
                </p>
                <p
                  className={`text-sm ${
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
              className={`group flex items-center p-4 border rounded-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-green-900 group-hover:bg-green-800"
                    : "bg-green-100 group-hover:bg-green-200"
                }`}
              >
                <UserPlus
                  className={`h-5 w-5 ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Subscribed Channels
                </p>
                <p
                  className={`text-sm ${
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
              className={`group flex items-center p-4 border rounded-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-purple-900 group-hover:bg-purple-800"
                    : "bg-purple-100 group-hover:bg-purple-200"
                }`}
              >
                <Eye
                  className={`h-5 w-5 ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  View Channel
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  See your public channel
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Components */}
        <VideoStats />
        <ChannelStats />
      </div>
    </div>
  );
}
