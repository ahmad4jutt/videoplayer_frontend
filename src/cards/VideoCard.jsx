import React from "react";
import { Link } from "react-router-dom";
import { Eye, Clock, Calendar } from "lucide-react";
const VideoCard = ({ video }) => {
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || "0";
  };
  const formatDuration = (second) => {
    if (!second) return "0:00";

    const totalSeconds = Math.round(second);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const formatDate = (dateString) => {
    if (!dateString) return "unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };
  return (
    <div className="bg-white dark:bg-gray-800  shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <Link to={`/video/${video._id}`} className="block">
        {/* Thumbnail Container */}
        <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
          {video.thumbnail ? (
            <img
              src={video.thumbnail.url}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
              <span className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                No Thumbnail
              </span>
            </div>
          )}

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock size={12} />
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {video.title || "Untitled Video"}
          </h3>

          {/* Channel Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {video.createdBy?.fullName?.charAt(0)?.toUpperCase() ||
                // video.createdBy?.username?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium truncate">
              {video.createdBy?.fullName ||
                // video.createdBy?.username ||
                "Unknown Channel"}
            </span>
          </div>

          {/* Video Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{formatViews(video.views)} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>

          {/* Category Badge */}
          {video.category && (
            <div className="mt-3">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                {video.category}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;
