import React, { useState, useEffect } from "react";
import {
  Play,
  Eye,
  Calendar,
  Clock,
  Users,
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  ChevronRight,
  Edit,
  Trash2,
  Settings,
  X,
  Save,
  Upload,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getChannelVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "react-toastify";

const ChannelVideoPage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showDropdown, setShowDropdown] = useState({});
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    thumbnail: null,
  });
  const [editTagInput, setEditTagInput] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState({});
  const categories = [
    "Education",
    "Entertainment",
    "Music",
    "Gaming",
    "Sports",
    "Technology",
    "Travel",
    "Food",
    "Lifestyle",
    "News",
    "Comedy",
    "Tutorial",
    "Review",
    "Vlog",
    "Documentary",
    "Animation",
    "Art",
    "Science",
    "Health",
    "Business",
    "Other",
  ];
  const { token } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchChannelVideos();
  }, []);
  const toggleDropdown = (videoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown((prev) => ({
      ...prev,
      [videoId]: !prev[videoId],
    }));
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown({});
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const fetchChannelVideos = async () => {
    try {
      setLoading(true);
      const response = await getChannelVideo(token);

      if (response.data.success) {
        setVideos(response.data.data);
      } else {
        setError("Failed to fetch videos");
      }
    } catch (err) {
      setError("Error fetching videos: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    navigate(-1);
  };
  const handleEditVideo = (video) => {
    setSelectedVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || "",
      category: video.category || "",
      tags: video.tags || [],
    });
    setEditTagInput("");
    setShowEditModal(true);
  };

  const handleUpdateVideo = async () => {
    if (!selectedVideo) return;

    try {
      setEditLoading(true);

      const updateData = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        tags: JSON.stringify(editForm.tags),
      };

      if (editForm.thumbnail) {
        updateData.thumbnail = editForm.thumbnail;
      }

      const response = await updateVideo(token, selectedVideo._id, updateData);

      if (response.data.success) {
        // Update the video in the local state while preserving owner info
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video._id === selectedVideo._id
              ? {
                  ...video,
                  ...response.data.data,
                  owner: video.owner, // Preserve the original owner data
                }
              : video
          )
        );

        toast.success("Video updated successfully!");
        setShowEditModal(false);
        setSelectedVideo(null);
        setEditForm({
          title: "",
          description: "",
          category: "",
          tags: [],
        });
        setEditTagInput("");
      }
    } catch (error) {
      toast.error(
        "Failed to update video: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    try {
      setDeleteLoading(true);

      const response = await deleteVideo(token, selectedVideo._id);

      if (response.data.success) {
        // Remove the video from local state
        setVideos((prevVideos) =>
          prevVideos.filter((video) => video._id !== selectedVideo._id)
        );

        toast.success("Video deleted successfully!");
        setShowDeleteConfirm(false);
        setSelectedVideo(null);
      }
    } catch (error) {
      toast.error(
        "Failed to delete video: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTogglePublish = async (video) => {
    try {
      setPublishLoading((prev) => ({ ...prev, [video._id]: true }));

      const response = await togglePublishStatus(token, video._id);

      if (response.data.success) {
        // Update the video in the local state
        setVideos((prevVideos) =>
          prevVideos.map((v) =>
            v._id === video._id ? { ...v, isPublished: !v.isPublished } : v
          )
        );

        const message = response.data.data.isPublished
          ? "Video published successfully!"
          : "Video unpublished successfully!";
        toast.success(message);
      }
    } catch (error) {
      toast.error(
        "Failed to toggle publish status: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setPublishLoading((prev) => ({ ...prev, [video._id]: false }));
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M";
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K";
    }
    return views.toString();
  };

  const handleShare = async (video = null, type = "video") => {
    try {
      const shareData = {
        video: {
          title: video.title,
          text: `Check out this video: ${video.title}`,
          url: `${window.location.origin}/video/${video._id}`,
        },
        channel: {
          title: `${videos[0]?.owner.fullName}'s Channel`,
          text: `Check out ${videos[0]?.owner.fullName}'s channel with ${videos.length} videos!`,
          url: window.location.href,
        },
      };

      const data = shareData[type];

      if (navigator.share && navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);
        toast.success(`Link copied to clipboard!`);
      }
    } catch (error) {
      toast.error("Error sharing:", error);
      try {
        const url =
          type === "video"
            ? `${window.location.origin}/video/${video._id}`
            : window.location.href;
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
      }
    }
  };

  const handleVideoClick = (video) => {};

  const totalViews = videos.reduce((total, video) => total + video.views, 0);

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`w-48 h-8 rounded-lg animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              </div>
              <div
                className={`w-32 h-10 rounded-lg animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div
                className={`flex-1 h-12 rounded-xl animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-40 h-12 rounded-xl animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className={`backdrop-blur-sm rounded-2xl overflow-hidden border ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-white/50 border-gray-200/50"
                }`}
              >
                <div
                  className={`h-48 animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div className="p-5 space-y-3">
                  <div
                    className={`h-4 rounded animate-pulse ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 rounded w-3/4 animate-pulse ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div className="flex justify-between">
                    <div
                      className={`h-3 rounded w-16 animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`h-3 rounded w-20 animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
        } flex items-center justify-center px-4`}
      >
        <div
          className={`text-center p-6 sm:p-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg max-w-md mx-auto shadow-lg w-full`}
        >
          <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
          <h3
            className={`text-lg sm:text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Something went wrong
          </h3>
          <p
            className={`${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } mb-6 text-sm sm:text-base`}
          >
            {error}
          </p>
          <button
            onClick={fetchChannelVideos}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header with User Details */}
      <div className="relative">
        {/* Cover Image - Only show if it exists */}
        {videos.length > 0 && videos[0].owner.coverImage && (
          <div className="h-48 sm:h-64 md:h-80 lg:h-96 relative overflow-hidden">
            <img
              src={videos[0].owner.coverImage}
              alt="Channel Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>
        )}

        {/* User Profile Section - Always show if videos exist */}
        {videos.length > 0 && (
          <div
            className={`relative ${
              videos[0].owner.coverImage ? "-mt-12 sm:-mt-16" : "mt-0"
            } z-10`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              {/* User Info - Top Row */}
              <div
                className={`flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 ${
                  videos[0].owner.coverImage
                    ? "text-white"
                    : isDarkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={videos[0].owner.avatar}
                    alt={videos[0].owner.fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white"></div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h1
                    className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 ${
                      isDarkMode
                        ? "text-white bg-none"
                        : "text-white rounded-sm bg-gray-600 w-[50%]"
                    } truncate`}
                  >
                    {videos[0].owner.fullName}
                  </h1>
                  <p
                    className={`${
                      videos[0].owner.coverImage
                        ? "text-gray-200"
                        : isDarkMode
                        ? "text-gray-300"
                        : "text-gray-600 "
                    } text-sm sm:text-base`}
                  >
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {" "}
                      {videos.length} {videos.length === 1 ? "video" : "videos"}{" "}
                      • {formatViews(totalViews)} total views
                    </p>
                  </p>
                </div>
              </div>

              {/* Stats Grid - Separate row */}
              <div className="mb-8 sm:mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <div
                    className={`p-3 sm:p-4 ${
                      videos[0].owner.coverImage
                        ? "bg-black/40 border-white/10"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } backdrop-blur-sm rounded-xl border`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      </div>
                      <div>
                        <div
                          className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                            videos[0].owner.coverImage
                              ? "text-white"
                              : isDarkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {totalViews.toLocaleString()}
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${
                            videos[0].owner.coverImage
                              ? "text-gray-300"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Total Views
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 sm:p-4 ${
                      videos[0].owner.coverImage
                        ? "bg-black/40 border-white/10"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } backdrop-blur-sm rounded-xl border`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      </div>
                      <div>
                        <div
                          className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                            videos[0].owner.coverImage
                              ? "text-white"
                              : isDarkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {videos.length}
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${
                            videos[0].owner.coverImage
                              ? "text-gray-300"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {videos.length === 1 ? "Video" : "Videos"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 sm:p-4 sm:col-span-2 lg:col-span-1 ${
                      videos[0].owner.coverImage
                        ? "bg-black/40 border-white/10"
                        : isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } backdrop-blur-sm rounded-xl border`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-600/20 rounded-lg">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      </div>
                      <div>
                        <div
                          className={`text-sm sm:text-base lg:text-lg font-bold ${
                            videos[0].owner.coverImage
                              ? "text-white"
                              : isDarkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {formatDate(
                            videos[0].owner.createdAt || videos[0].createdAt
                          )}
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${
                            videos[0].owner.coverImage
                              ? "text-gray-300"
                              : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Joined
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Header */}
              <div
                className={`border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-300"
                } pt-6 sm:pt-8 mb-6 sm:mb-8`}
              >
                <h2
                  className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } mb-2 flex items-center justify-center sm:justify-start`}
                >
                  your Videos
                  <ChevronRight
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } ml-2`}
                  />
                </h2>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        {videos.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div
              className={`${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              } text-6xl sm:text-8xl mb-6 sm:mb-8`}
            >
              📹
            </div>
            <h3
              className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              No videos yet
            </h3>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } text-base sm:text-lg px-4`}
            >
              Upload video to see your channel
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="group "
                onClick={() => handleVideoClick(video)}
                onMouseEnter={() => setHoveredVideo(video._id)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                <div
                  className={`${
                    isDarkMode
                      ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  } rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl shadow-md`}
                >
                  {/* Thumbnail */}
                  <Link to={`/video/${video._id}`}>
                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={video.thumbnail.url}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`transform transition-all duration-300 ${
                            hoveredVideo === video._id
                              ? "scale-100 opacity-100"
                              : "scale-90 opacity-0"
                          }`}
                        >
                          <div className="p-4 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-white/20">
                            <Play className="w-6 h-6 text-gray-800 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Duration badge */}
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
                        {formatDuration(video.duration)}
                      </div>

                      {/* View count badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatViews(video.views)}
                      </div>

                      {/* Publish status badge */}
                      <div
                        className={`absolute top-3 right-3 ${
                          video.isPublished
                            ? "bg-green-600/90"
                            : "bg-yellow-600/90"
                        } backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md`}
                      >
                        {video.isPublished ? "Published" : "Draft"}
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Video Info */}
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    {/* Section 1: Image */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={video.owner.avatar}
                          alt={video.owner.fullName}
                          className={`w-12 h-12 object-cover rounded-full border-2 ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                    </div>

                    {/* Section 2: Title, Views, Date, Owner Name */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3
                        className={`font-semibold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        } mb-2 line-clamp-2 text-base leading-snug`}
                      >
                        {video.title}
                      </h3>

                      {/* Owner Name */}
                      <div className="mb-2">
                        <span
                          className={`${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          } text-sm font-medium`}
                        >
                          {video.owner.fullName}
                        </span>
                      </div>

                      {/* Views and Date */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Eye
                            className={`w-4 h-4 mr-1.5 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            } font-medium`}
                          >
                            {formatViews(video.views)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar
                            className={`w-4 h-4 mr-1.5 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            } font-medium`}
                          >
                            {formatDate(video.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Action Buttons */}
                    <div className="flex-shrink-0 relative">
                      {/* Large screens - Show only more button */}
                      <div className="hidden lg:block">
                        <button
                          onClick={(e) => toggleDropdown(video._id, e)}
                          className={`p-2 ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                              : "hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                          } rounded-lg transition-all duration-200 hover:scale-105`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown menu for large screens */}
                        {showDropdown[video._id] && (
                          <div
                            className={`absolute right-0 -top-15 mt-2 w-48 ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                            } border rounded-lg shadow-xl z-50`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Share Option */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleShare(video, "video");
                                setShowDropdown((prev) => ({
                                  ...prev,
                                  [video._id]: false,
                                }));
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                                isDarkMode
                                  ? "hover:bg-gray-700 text-gray-300 hover:text-blue-400"
                                  : "hover:bg-gray-50 text-gray-700 hover:text-blue-600"
                              } transition-colors rounded-t-lg`}
                            >
                              <Share2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Share</span>
                            </button>

                            {/* Toggle Publish Option */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTogglePublish(video);
                                setShowDropdown((prev) => ({
                                  ...prev,
                                  [video._id]: false,
                                }));
                              }}
                              disabled={publishLoading[video._id]}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                                isDarkMode
                                  ? "hover:bg-gray-700 text-gray-300 hover:text-green-400"
                                  : "hover:bg-gray-50 text-gray-700 hover:text-green-600"
                              } transition-colors disabled:opacity-50`}
                            >
                              {publishLoading[video._id] ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                              ) : video.isPublished ? (
                                <ToggleRight className="w-4 h-4 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium">
                                {video.isPublished ? "Unpublish" : "Publish"}
                              </span>
                            </button>

                            {/* Edit Option */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditVideo(video);
                                setShowDropdown((prev) => ({
                                  ...prev,
                                  [video._id]: false,
                                }));
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                                isDarkMode
                                  ? "hover:bg-gray-700 text-gray-300 hover:text-yellow-400"
                                  : "hover:bg-gray-50 text-gray-700 hover:text-yellow-600"
                              } transition-colors`}
                            >
                              <Edit className="w-4 h-4" />
                              <span className="text-sm font-medium">Edit</span>
                            </button>

                            {/* Delete Option */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedVideo(video);
                                setShowDeleteConfirm(true);
                                setShowDropdown((prev) => ({
                                  ...prev,
                                  [video._id]: false,
                                }));
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                                isDarkMode
                                  ? "hover:bg-gray-700 text-gray-300 hover:text-red-400"
                                  : "hover:bg-gray-50 text-gray-700 hover:text-red-600"
                              } transition-colors rounded-b-lg border-t ${
                                isDarkMode
                                  ? "border-gray-700"
                                  : "border-gray-200"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Delete
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Small/Medium screens - Show all buttons horizontally */}
                      <div className="flex lg:hidden items-center space-x-1">
                        {/* Share Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShare(video, "video");
                          }}
                          className={`p-2 ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-gray-400 hover:text-blue-400"
                              : "hover:bg-gray-50 text-gray-500 hover:text-blue-600"
                          } rounded-lg transition-all duration-200 hover:scale-105`}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Toggle Publish Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTogglePublish(video);
                          }}
                          disabled={publishLoading[video._id]}
                          className={`p-2 ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-gray-400 hover:text-green-400"
                              : "hover:bg-gray-50 text-gray-500 hover:text-green-600"
                          } rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50`}
                        >
                          {publishLoading[video._id] ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                          ) : video.isPublished ? (
                            <ToggleRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditVideo(video);
                          }}
                          className={`p-2 ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-gray-400 hover:text-yellow-400"
                              : "hover:bg-gray-50 text-gray-500 hover:text-yellow-600"
                          } rounded-lg transition-all duration-200 hover:scale-105`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedVideo(video);
                            setShowDeleteConfirm(true);
                          }}
                          className={`p-2 ${
                            isDarkMode
                              ? "hover:bg-gray-800 text-gray-400 hover:text-red-400"
                              : "hover:bg-gray-50 text-gray-500 hover:text-red-600"
                          } rounded-lg transition-all duration-200 hover:scale-105`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {showEditModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Edit Video
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVideo(null);
                  setEditForm({
                    title: "",
                    description: "",
                    category: "",
                    tags: [],
                  });
                }}
                className={`p-2 ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                } rounded-lg transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Title and Category Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Title Input */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Video Title *
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                    } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Enter video title"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                    } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className={`w-full px-4 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  } border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none`}
                  placeholder="Enter video description"
                />
              </div>

              {/* Current Video Info Display */}
              {selectedVideo && (
                <div
                  className={`p-4 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-200"
                  } border rounded-lg`}
                >
                  <h4
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Current Video Details
                  </h4>
                  <div className="flex items-start space-x-4">
                    {selectedVideo.thumbnail && (
                      <img
                        src={selectedVideo.thumbnail.url}
                        alt={selectedVideo.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        } mb-1`}
                      >
                        <strong>Current Title:</strong> {selectedVideo.title}
                      </p>
                      {selectedVideo.category && (
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          } mb-1`}
                        >
                          <strong>Current Category:</strong>{" "}
                          {selectedVideo.category}
                        </p>
                      )}
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatViews(selectedVideo.views)} views •{" "}
                        {formatDate(selectedVideo.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`flex items-center justify-end gap-4 p-6 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVideo(null);
                  setEditForm({
                    title: "",
                    description: "",
                    category: "",
                    tags: [],
                  });
                  setEditTagInput("");
                }}
                className={`px-6 py-2 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } rounded-lg transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateVideo}
                disabled={editLoading || !editForm.title.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }  border shadow-2xl w-full max-w-md`}
          >
            {/* Modal Header */}
            <div
              className={`p-6 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3
                  className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Delete Video
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p
                className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                } mb-4`}
              >
                Are you sure you want to delete this video? This action cannot
                be undone.
              </p>
              <div
                className={`p-4 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-gray-50 border-gray-200"
                } border rounded-lg`}
              >
                <h4
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } mb-1`}
                >
                  {selectedVideo.title}
                </h4>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {formatViews(selectedVideo.views)} views •{" "}
                  {formatDate(selectedVideo.createdAt)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`flex items-center justify-end gap-4 p-6 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedVideo(null);
                }}
                className={`px-6 py-2 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } rounded-lg transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVideo}
                disabled={deleteLoading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelVideoPage;
