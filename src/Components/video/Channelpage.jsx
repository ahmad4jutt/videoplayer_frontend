import React, { useState, useEffect } from "react";
import { Play, Users, Calendar, Clock, Eye } from "lucide-react";
import { getChannelVideo } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
const { token } = useAuth();

const Channelpage = ({
  channelId,
  channelData,
  token,
  onVideoClick,
  onBackClick,
}) => {
  const [channelData, setChannelData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    fetchChannelData();
  }, [channelId, token]);

  const fetchChannelData = async () => {
    try {
      const response = await getChannelVideo(token);
      if (response.data) {
        setChannelData(response.data.channel || response.data);
        setVideos(response.data.videos || response.data.data || []);
      }
    } catch (err) {
      setError("Failed to load channel data");
      console.error("Error fetching channel data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return "0:00";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || "0";
  };
  const mockChannelData = {
    fullName: channelData?.fullName || "Content Creator",
    avatar: channelData?.avatar,
    subscribersCount: channelData?.subscribersCount || 0,
    videosCount: videos?.length || 0,
    description: channelData?.description || "Welcome to my channel!",
    createdAt: channelData?.createdAt || new Date().toISOString(),
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Back to Videos
          </button>
        )}

        {/* Channel Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              {mockChannelData.avatar ? (
                <img
                  src={mockChannelData.avatar}
                  alt={mockChannelData.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 dark:border-blue-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-blue-200 dark:border-blue-800">
                  {mockChannelData.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockChannelData.fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {mockChannelData.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {formatViews(mockChannelData.subscribersCount)} subscribers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span>{mockChannelData.videosCount} videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(mockChannelData.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Subscribe Button */}
            <div className="flex-shrink-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
          <div className="flex border-b dark:border-gray-700">
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "videos"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Videos ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "about"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === "videos" ? (
          <div>
            {videos.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📹</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No videos yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This channel hasn't uploaded any videos yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <div
                    key={video._id || video.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                    onClick={() => onVideoClick && onVideoClick(video)}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Play className="w-12 h-12" />
                        </div>
                      )}

                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {video.title || "Untitled Video"}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(video.views)} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // About Tab
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              About {mockChannelData.fullName}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {mockChannelData.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Stats
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatViews(mockChannelData.subscribersCount)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      subscribers
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {mockChannelData.videosCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      videos
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatDate(mockChannelData.createdAt)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      joined
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channelpage;
