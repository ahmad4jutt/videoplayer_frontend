import React from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Eye, TrendingUp } from "lucide-react";
import ChannelStats from "./Channelstat";
import VideoStats from "./VideoStats";
import { useAuth } from "../../hooks/UseAuth";
export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your channel performance</p>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* My Subscribers Link */}
            <Link
              to={`/subscribers/${currentUser?.channelId || currentUser?._id}`}
              className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  My Subscribers
                </p>
                <p className="text-sm text-gray-500">
                  View who follows your channel
                </p>
              </div>
            </Link>

            {/* Subscribed Channels Link */}
            <Link
              to="/subscribed-channels"
              className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Subscribed Channels
                </p>
                <p className="text-sm text-gray-500">
                  Channels you're following
                </p>
              </div>
            </Link>

            {/* Channel Analytics Link (Optional) */}
            <Link
              to={`/channel/${currentUser?.channelId || currentUser?._id}`}
              className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  View Channel
                </p>
                <p className="text-sm text-gray-500">See your public channel</p>
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
