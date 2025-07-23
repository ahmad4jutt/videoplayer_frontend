import { useEffect, useState } from "react";
import {
  getChannelVideos,
  togglePublishStatus,
  deleteVideo,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Video Management
          </h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-20 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Video Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {videos.length} video{videos.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Published
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Draft
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="divide-y divide-gray-200">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((video, index) => (
            <div
              key={video._id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        video.isPublished ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {video.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              video.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {video.isPublished ? "Published" : "Draft"}
                          </span>
                          {video.views !== undefined && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Eye className="w-3 h-3 mr-1" />
                              {video.views.toLocaleString()} views
                            </div>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
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
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === video._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleTogglePublish(video._id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
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
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No videos yet
            </h3>
            <p className="text-sm text-gray-500">
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
