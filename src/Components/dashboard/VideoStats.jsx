import { useEffect, useState } from "react";
import {
  getChannelVideos,
  togglePublishStatus,
  deleteVideo,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import {
  Play,
  MoreHorizontal,
  Eye,
  Calendar,
  Edit,
  Trash2,
  Video,
} from "lucide-react";

export default function VideoStats() {
  const { token } = useAuth();
  const { isDarkMode } = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    setLoading(true);
    getChannelVideos(token)
      .then((res) => {
        setVideos(res.data?.data?.videos || []);
      })
      .catch((err) => {
        console.error("Failed to fetch videos:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const refresh = () => {
    setLoading(true);
    getChannelVideos(token)
      .then((res) => {
        setVideos(res.data?.data?.videos || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleTogglePublish = async (videoId) => {
    try {
      await togglePublishStatus(token, videoId);
      refresh();
      setActiveDropdown(null);
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo(token, videoId);
        refresh();
        setActiveDropdown(null);
      } catch (error) {
        console.error("Failed to delete video:", error);
      }
    }
  };

  if (loading) {
    return (
      <div
        className={`rounded-lg shadow-sm border ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Video Management
          </h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div
                  className={`w-20 h-12 rounded ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div className="flex-1 space-y-2">
                  <div
                    className={`h-4 rounded w-3/4 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-3 rounded w-1/2 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg shadow-sm border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`p-6 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Video Management
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {videos.length} video{videos.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-4 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Published
              </div>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isDarkMode ? "bg-gray-600" : "bg-gray-400"
                  }`}
                ></div>
                Draft
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div
        className={`divide-y ${
          isDarkMode ? "divide-gray-700" : "divide-gray-200"
        }`}
      >
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((video, index) => (
            <div
              key={video._id}
              className={`p-6 transition-colors ${
                isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-20 h-12 rounded-lg flex items-center justify-center ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-900"
                      }`}
                    >
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${
                        isDarkMode ? "border-gray-800" : "border-white"
                      } ${
                        video.isPublished
                          ? "bg-green-500"
                          : isDarkMode
                          ? "bg-gray-600"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-sm font-medium truncate ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {video.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              video.isPublished
                                ? isDarkMode
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : isDarkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {video.isPublished ? "Published" : "Draft"}
                          </span>
                          {video.views !== undefined && (
                            <div
                              className={`flex items-center text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              {video.views.toLocaleString()} views
                            </div>
                          )}
                          <div
                            className={`flex items-center text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(
                              video.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative flex-shrink-0 ml-4">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === video._id ? null : video._id
                      )
                    }
                    className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-300 focus:ring-offset-gray-800"
                        : "text-gray-400 hover:text-gray-600 focus:ring-offset-white"
                    }`}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === video._id && (
                    <div
                      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg border z-10 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => handleTogglePublish(video._id)}
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            isDarkMode
                              ? "text-gray-300 hover:bg-gray-600"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {video.isPublished ? (
                            <>
                              <Edit className="w-4 h-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Publish
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            isDarkMode
                              ? "text-red-400 hover:bg-red-900/20"
                              : "text-red-700 hover:bg-red-50"
                          }`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <Video
                className={`w-6 h-6 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </div>
            <h3
              className={`text-sm font-medium mb-1 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              No videos yet
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Upload your first video to get started.
            </p>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}
