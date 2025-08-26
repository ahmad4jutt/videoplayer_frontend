import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Play,
  Settings,
  Heart,
  UserPlus,
  Video,
  Eye,
} from "lucide-react";
import { getSubscribedChannelNotifications } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { Link, useParams } from "react-router-dom";

const NotificationModal = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    hoursBack: 168,
    onlyUnwatched: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getSubscribedChannelNotifications(
        token,
        filters.page,
        filters.limit,
        filters.hoursBack,
        filters.onlyUnwatched
      );

      setNotifications(response.data.data.notifications);
      setSummary(response.data.data.summary);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setSummary({});
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_video":
        return <Video className="w-4 h-4 text-red-500" />;
      case "video_liked":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "new_subscriber":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3:
        return "border-l-red-500";
      case 2:
        return "border-l-green-500";
      case 1:
        return "border-l-pink-500";
      default:
        return "border-l-gray-400";
    }
  };

  const renderNotificationContent = (notification) => {
    const { notificationType, data, channel } = notification;

    switch (notificationType) {
      case "new_video":
        if (!data) {
          console.error(
            "Video data is missing for notification:",
            notification
          );
          return (
            <div className="text-red-500 text-sm">
              Error: Video data is missing
            </div>
          );
        }

        return (
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              <img
                src={channel?.avatar}
                alt={channel?.fullName || "Channel"}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm"
              />
            </div>

            {/* Content */}
            <Link to={`/video/${data._id}`} onClick={onClose}>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span
                    className={`text-sm font-bold   ${
                      isDarkMode ? "text-gray-200" : "text-gray-500"
                    } `}
                  >
                    {channel?.fullName || "Unknown Channel"}
                  </span>
                  <span className="text-sm ml-1 text-gray-600 dark:text-gray-400">
                    uploaded a new video
                  </span>
                </div>

                <h3
                  className={`text-sm sm:text-base font-semibold line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors  ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {data.title || "Untitled Video"}
                </h3>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {formatTimeAgo(data.createdAt || notification.timestamp)}
                  </span>
                  {data.views && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(data.views)} views</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
            {/* Video Thumbnail */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <Link to={`/video/${data._id}`} onClick={onClose}>
                <div className="relative rounded-lg overflow-hidden group/video">
                  <img
                    src={data.thumbnail?.url || data.thumbnail}
                    alt={data.title || "Video thumbnail"}
                    className="w-full sm:w-20 lg:w-24 h-32 sm:h-12 lg:h-16 object-cover transition-transform duration-300 group-hover/video:scale-105"
                  />
                  <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover/video:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="transform scale-0 group-hover/video:scale-100 transition-transform duration-200">
                      <Play className="w-6 h-6 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        );

      case "video_liked":
        if (!data) {
          console.error(
            "Video data is missing for liked video notification:",
            notification
          );
          return (
            <div className="text-red-500 text-sm">
              Error: Video data is missing
            </div>
          );
        }

        return (
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-shrink-0">
              <img
                src={data.liker?.avatar}
                alt={data.liker?.fullName || "User"}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <span
                  className={`text-sm font-bold ${
                    isDarkMode ? "text-gray-500" : "text-gray-700"
                  }`}
                >
                  {data.liker?.fullName || "Someone"}
                </span>
                <span
                  className={`text-sm ml-1  ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  liked your video
                </span>
              </div>

              <h3
                className={` text-sm sm:text-base font-medium line-clamp-2 mb-1 group-hover:text-pink-500 transition-colors   ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {data.video?.title || "Untitled Video"}
              </h3>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span>{formatTimeAgo(notification.timestamp)}</span>
                {data.video?.views && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{formatViews(data.video.views)} views</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Video Thumbnail - Your video that was liked */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <div className="relative rounded-lg overflow-hidden group/video">
                <img
                  src={data.video?.thumbnail?.url || data.video?.thumbnail}
                  alt={data.video?.title || "Video thumbnail"}
                  className="w-full sm:w-20 lg:w-24 h-32 sm:h-12 lg:h-16 object-cover transition-transform duration-300 group-hover/video:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/video:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div className="transform scale-0 group-hover/video:scale-100 transition-transform duration-200">
                    <Heart className="w-6 h-6 sm:w-5 sm:h-5 text-pink-500 drop-shadow-lg fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "new_subscriber":
        if (!data) {
          console.error(
            "Subscriber data is missing for notification:",
            notification
          );
          return (
            <div className="text-red-500 text-sm">
              Error: Subscriber data is missing
            </div>
          );
        }

        return (
          <div className="flex items-start space-x-4">
            {/* New Subscriber Avatar */}
            <div className="flex-shrink-0">
              <img
                src={data.avatar}
                alt={data.fullName || "User"}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <span
                  className={`text-sm font-semibold   ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {data.fullName || "Unknown User"}
                </span>
                <span
                  className={`text-sm   ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  subscribed to your channel
                </span>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatTimeAgo(notification.timestamp)}
              </div>
            </div>

            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={channel?.avatar}
                  alt={channel?.fullName || "Your Channel"}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <UserPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {notification.notificationText}
              </p>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-0" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
      </div>

      {/* Modal */}
      <div
        className={`fixed top-0 sm:top-4 right-0 sm:right-4 lg:right-8 xl:right-30 z-50 
          h-full sm:h-[94vh] 
          w-full sm:w-80 md:w-96 lg:w-[28rem] xl:w-[30rem] 
          transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div
          className={`h-full w-full ${
            isDarkMode ? "bg-gray-900" : "bg-white"
          } shadow-xl sm:rounded-lg flex flex-col`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-3 sm:p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                {summary.totalNotifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h2
                  className={`text-base sm:text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Notifications
                </h2>
                {summary.totalNotifications > 0 && (
                  <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-xs">
                    {summary.totalNewVideos > 0 && (
                      <span className="text-red-500 font-medium">
                        {summary.totalNewVideos} videos
                      </span>
                    )}
                    {summary.totalNewLikes > 0 && (
                      <span className="text-pink-500 font-medium">
                        {summary.totalNewLikes} likes
                      </span>
                    )}
                    {summary.totalNewSubscribers > 0 && (
                      <span className="text-green-500 font-medium">
                        {summary.totalNewSubscribers} subscribers
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showFilters
                    ? "bg-blue-100 text-blue-600"
                    : `${
                        isDarkMode
                          ? "hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                          : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      }`
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showFilters ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div
              className={`p-3 sm:p-4 border-b space-y-3 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <select
                  value={filters.hoursBack}
                  onChange={(e) =>
                    handleFilterChange("hoursBack", parseInt(e.target.value))
                  }
                  className={`text-xs px-3 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 transition-all flex-1 ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <option value={24}>Last 24h</option>
                  <option value={72}>Last 3 days</option>
                  <option value={168}>Last week</option>
                  <option value={720}>Last month</option>
                </select>
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    handleFilterChange("limit", parseInt(e.target.value))
                  }
                  className={`text-xs px-3 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 transition-all flex-1 ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-200"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <option value={5}>5 per page</option>
                  <option value={8}>8 per page</option>
                  <option value={15}>15 per page</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlyUnwatched}
                  onChange={(e) =>
                    handleFilterChange("onlyUnwatched", e.target.checked)
                  }
                  className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                />
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Show only unwatched
                </span>
              </label>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <div
                    className={`w-8 h-8 border-3 rounded-full animate-spin ${
                      isDarkMode
                        ? "border-gray-700 border-t-blue-400"
                        : "border-gray-200 border-t-blue-600"
                    }`}
                  ></div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3
                  className={`text-base font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  All caught up!
                </h3>
                <p className="text-sm text-gray-500">No new notifications</p>
              </div>
            ) : (
              <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.notificationId}
                    className={`group cursor-pointer rounded-lg p-3 sm:p-4 transition-all duration-200 hover:scale-[1.01] border-l-4 ${getPriorityColor(
                      notification.priority
                    )} ${
                      isDarkMode
                        ? "bg-gray-800 hover:bg-gray-750"
                        : "bg-white hover:bg-gray-50"
                    } hover:shadow-md`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isOpen
                        ? "slideInUp 0.3s ease-out forwards"
                        : "none",
                    }}
                  >
                    {/* Notification Icon */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.notificationType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs font-medium uppercase tracking-wide ${
                            notification.notificationType === "new_video"
                              ? "text-red-500"
                              : notification.notificationType === "video_liked"
                              ? "text-pink-500"
                              : "text-green-500"
                          }`}
                        >
                          {notification.notificationType.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Notification Content */}
                    {renderNotificationContent(notification)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .line-clamp-2 {
            -webkit-line-clamp: 3;
          }
        }
      `}</style>
    </>
  );
};

export default NotificationModal;
