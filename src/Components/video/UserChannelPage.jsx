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
  Settings,
  Bell,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserChannelVideos } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useParams } from "react-router-dom";

const UserChannelPage = () => {
  const navigate = useNavigate();
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [limit, setLimit] = useState(12);

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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={video.thumbnail.url}
          alt={video.title}
          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="text-white" size={32} fill="white" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-sm font-medium">
            {formatDuration(video.duration)}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {video.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-full">
              <Eye size={14} className="mr-1.5" />
              <span className="font-medium">{formatViews(video.views)}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const VideoListItem = ({ video }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200">
      <div className="flex">
        <div className="relative w-72 h-40 flex-shrink-0 overflow-hidden">
          <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-sm font-medium">
              {formatDuration(video.duration)}
            </span>
          </div>
        </div>
        <div className="flex-1 p-6">
          <h3 className="font-bold text-gray-900 text-xl mb-3 group-hover:text-blue-600 cursor-pointer transition-colors duration-300">
            {video.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {video.description}
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
              <Eye size={14} className="mr-1.5" />
              <span className="font-medium">
                {formatViews(video.views)} views
              </span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading channel content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button
            onClick={fetchChannelData}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-600 font-medium">No channel data available</p>
      </div>
    );
  }

  const { channelInfo, videos, pagination } = channelData;

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Channel Header */}
      <div className="relative">
        {/* Cover Image with Overlay */}
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={channelInfo.coverImage}
            alt={`${channelInfo.fullName} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Channel Info Card */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 -mt-24 relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                <div className="relative">
                  <img
                    src={channelInfo.avatar}
                    alt={channelInfo.fullName}
                    className="w-28 h-28 lg:w-36 lg:h-36 rounded-full border-4 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        {channelInfo.fullName}
                      </h1>
                      <p className="text-blue-600 font-medium text-lg mb-4">
                        @{channelInfo.username}
                      </p>

                      <div className="flex items-center space-x-6 text-gray-600">
                        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full">
                          <Users size={18} className="mr-2 text-blue-600" />
                          <span className="font-bold text-blue-800">
                            {formatSubscribers(channelInfo.totalSubscribers)}
                          </span>
                          <span className="ml-1 text-sm">subscribers</span>
                        </div>
                        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full">
                          <Play size={18} className="mr-2 text-gray-600" />
                          <span className="font-bold text-gray-800">
                            {pagination.total}
                          </span>
                          <span className="ml-1 text-sm">videos</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center">
                        <Bell size={18} className="mr-2" />
                        Subscribe
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors duration-300">
                        <Share2 size={18} />
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors duration-300">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <option value="createdAt">Date</option>
                  <option value="title">Title</option>
                  <option value="views">Views</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    viewType === "grid"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2.5 rounded-lg transition-all duration-300 ${
                    viewType === "list"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Videos */}
        {videos.length > 0 ? (
          <div
            className={
              viewType === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-6"
            }
          >
            {videos.map((video) =>
              viewType === "grid" ? (
                <button
                  key={video._id}
                  onClick={() => handleVideoClick(video._id)}
                  className="text-left"
                >
                  <VideoCard video={video} />
                </button>
              ) : (
                <button
                  key={video._id}
                  onClick={() => handleVideoClick(video._id)}
                  className="text-left w-full"
                >
                  <VideoListItem video={video} />
                </button>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500">
              This channel hasn't uploaded any videos yet.
            </p>
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`p-3 rounded-xl transition-all duration-300 ${
                pagination.hasPrev
                  ? "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm hover:shadow-md"
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
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className={`p-3 rounded-xl transition-all duration-300 ${
                pagination.hasNext
                  ? "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm hover:shadow-md"
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
