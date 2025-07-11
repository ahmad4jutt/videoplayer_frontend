import React, { useState, useEffect } from "react";
import {
  Play,
  Calendar,
  Eye,
  Clock,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { getUserChannelVideos } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useParams } from "react-router-dom";

const UserChannelPage = () => {
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [limit, setLimit] = useState(12);

  // Mock user ID and token (replace with actual values)
  const { userId } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    fetchChannelData();
  }, [currentPage, sortBy, sortType, limit]);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const response = await getUserChannelVideos(token, userId, {
        page: currentPage,
        limit,
        sortBy,
        sortType,
      });
      setChannelData(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch channel data");
      console.error("Error fetching channel data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || "0";
  };

  const formatSubscribers = (subscribers) => {
    if (subscribers >= 1000000) {
      return `${(subscribers / 1000000).toFixed(1)}M`;
    } else if (subscribers >= 1000) {
      return `${(subscribers / 1000).toFixed(1)}K`;
    }
    return subscribers?.toString() || "0";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const VideoCard = ({ video }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative group cursor-pointer">
        <img
          src={video.thumbnail.url}
          alt={video.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
          <Play
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            size={48}
          />
        </div>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
          {video.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye size={16} className="mr-1" />
              {formatViews(video.views)} views
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              {formatDate(video.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const VideoListItem = ({ video }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex">
        <div className="relative w-64 h-36 flex-shrink-0">
          <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-transparent bg-opacity-80 text-white px-2 py-1 rounded text-sm">
            {formatDuration(video.duration)}
          </div>
        </div>
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 cursor-pointer">
            {video.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {video.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye size={16} className="mr-1" />
              {formatViews(video.views)} views
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              {formatDate(video.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading channel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchChannelData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">No channel data available</p>
      </div>
    );
  }

  const { channelInfo, videos, pagination } = channelData;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Channel Header */}
      <div className="bg-white shadow-sm">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 md:h-52 lg:h-52 overflow-hidden">
            <img
              src={channelInfo.coverImage}
              alt={`${channelInfo.fullName} cover`}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Channel Info */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <img
                  src={channelInfo.avatar}
                  alt={channelInfo.fullName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {channelInfo.fullName}
                </h1>
                <p className="text-gray-600 mb-2">@{channelInfo.username}</p>
                <div className="flex items-center space-x-4 text-gray-500">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    {formatSubscribers(channelInfo.totalSubscribers)}{" "}
                    subscribers
                  </div>
                  <div className="flex items-center">
                    <Play size={16} className="mr-1" />
                    {pagination.total} videos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
              <option value="duration">Duration</option>
            </select>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewType("grid")}
                className={`p-2 ${
                  viewType === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-2 ${
                  viewType === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Videos */}
        {videos.length > 0 ? (
          <div
            className={
              viewType === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {videos.map((video) =>
              viewType === "grid" ? (
                <VideoCard key={video._id} video={video} />
              ) : (
                <VideoListItem key={video._id} video={video} />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No videos found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`p-2 rounded-md ${
                pagination.hasPrev
                  ? "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(Math.min(pagination.pages, 7))].map((_, index) => {
              let pageNum;
              if (pagination.pages <= 7) {
                pageNum = index + 1;
              } else if (currentPage <= 4) {
                pageNum = index + 1;
              } else if (currentPage >= pagination.pages - 3) {
                pageNum = pagination.pages - 6 + index;
              } else {
                pageNum = currentPage - 3 + index;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className={`p-2 rounded-md ${
                pagination.hasNext
                  ? "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChannelPage;
