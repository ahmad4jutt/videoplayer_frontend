// src/components/playlist/PlaylistCard.jsx
import { useState, useEffect } from "react";
import {
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  getAllVideos,
} from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { Play, X, Search } from "lucide-react";
import { toast } from "react-toastify";

// Video Selection Modal Component
const VideoSelectionModal = ({ isOpen, onClose, onSelectVideo, token }) => {
  const { isDarkMode } = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchVideos = async (page = 1, query = "") => {
    try {
      setLoading(true);
      const response = await getAllVideos(token, {
        page,
        limit: 12,
        query,
        sortBy: "createdAt",
        sortType: "desc",
      });
      setVideos(response.data.data.videos);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVideos(1, searchQuery);
      setCurrentPage(1);
    }
  }, [isOpen, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos(1, searchQuery);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchVideos(newPage, searchQuery);
  };

  const handleVideoSelect = (video) => {
    onSelectVideo(video._id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Select Video to Add
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl hover:bg-gray-100 transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <Search
                size={20}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </form>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 animate-spin text-gray-00"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Loading videos...
                </span>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`text-lg font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                No videos found
              </div>
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => handleVideoSelect(video)}
                  className={`cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md"
                  }`}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail?.url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                      style={{
                        display: video.thumbnail ? "none" : "flex",
                      }}
                    >
                      <Play size={32} className="text-white/80" />
                    </div>
                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(video.duration / 60)}:
                        {String(Math.floor(video.duration % 60)).padStart(
                          2,
                          "0"
                        )}
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-3">
                    <h3
                      className={`font-medium text-sm line-clamp-2 leading-tight mb-1 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                      title={video.title}
                    >
                      {video.title}
                    </h3>
                    <p
                      className={`text-xs mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      by {video.createdBy?.fullName || "Unknown"}
                    </p>
                    <div
                      className={`flex items-center text-xs ${
                        isDarkMode ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      <span>{video.views || 0} views</span>
                      <span className="mx-1">•</span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Pagination */}
        {pagination.pages > 1 && (
          <div
            className={`p-6 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Showing {videos.length} of {pagination.total} videos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pagination.hasPrev
                      ? isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "opacity-50 cursor-not-allowed " +
                        (isDarkMode ? "text-gray-600" : "text-gray-400")
                  }`}
                >
                  Previous
                </button>
                <span
                  className={`px-3 py-2 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Page {currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pagination.hasNext
                      ? isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "opacity-50 cursor-not-allowed " +
                        (isDarkMode ? "text-gray-600" : "text-gray-400")
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PlaylistCard({ playlist, onRefresh, token }) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: playlist.name,
    description: playlist.description || "",
  });
  const [showVideoSelectionModal, setShowVideoSelectionModal] = useState(false);

  const handleRemoveFirstVideo = async () => {
    if (!playlist.videos || playlist.videos.length === 0) {
      toast.error("No videos to remove");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to remove the first video from this playlist?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await removeVideoFromPlaylist(
        token,
        playlist.videos[0]._id,
        playlist._id
      );
      onRefresh();
    } catch (error) {
      console.error("Error removing video:", error);
      toast.error("Failed to remove video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlaylist = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    try {
      setLoading(true);
      console.log("Updating playlist:", playlist._id, editForm);
      await updatePlaylist(token, playlist._id, editForm);
      setShowEditForm(false);
      console.log("Playlist updated, calling refresh");
      onRefresh();
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error("Failed to update playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this playlist? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deletePlaylist(token, playlist._id);
      onRefresh();
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelection = async (videoId) => {
    try {
      setLoading(true);
      await addVideoToPlaylist(token, videoId, playlist._id);
      onRefresh();
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (showEditForm) {
    return (
      <div
        className={`rounded-2xl shadow-xl border p-8 backdrop-blur-sm ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Playlist
          </h3>
        </div>

        <form onSubmit={handleUpdatePlaylist} className="space-y-6">
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Playlist Name
            </label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                  : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-white"
              }`}
              required
            />
          </div>
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Description
            </label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditInputChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
                  : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-white"
              }`}
              placeholder="Add a description for your playlist..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div
        className={`rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border transform hover:scale-105 group ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        {/* Playlist Header */}
        <div className="relative overflow-hidden">
          {playlist.videos &&
          playlist.videos.length > 0 &&
          playlist.videos[0].thumbnail ? (
            <div className="relative">
              <img
                src={playlist.videos[0].thumbnail}
                alt={playlist.name}
                className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="w-full h-52 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-500 flex items-center justify-center relative overflow-hidden"
                style={{
                  display: "none",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-600/20 to-pink-500/20 animate-pulse"></div>
                <svg
                  className="w-20 h-20 text-white/90 z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19V6l12 4v7M5 15v4m0 0v-4m0 4h4m-4 0H1"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-500 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-600/20 to-pink-500/20 animate-pulse"></div>
              <svg
                className="w-20 h-20 text-white/90 z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12 4v7M5 15v4m0 0v-4m0 4h4m-4 0H1"
                />
              </svg>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Playlist Info */}
        <div className="p-6">
          <h3
            className={`font-bold text-xl mb-3 line-clamp-2 leading-tight ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
            title={playlist.name}
          >
            {playlist.name}
          </h3>

          {playlist.description && (
            <p
              className={`text-sm mb-4 line-clamp-3 leading-relaxed ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {playlist.description}
            </p>
          )}

          {/* Playlist Stats */}
          <div
            className={`flex items-center text-sm mb-6 rounded-xl p-3 ${
              isDarkMode
                ? "bg-gray-700 text-gray-400"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">
                {playlist.videos ? playlist.videos.length : 0} videos
              </span>
            </div>

            {playlist.createdAt && (
              <>
                <span
                  className={`mx-3 ${
                    isDarkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  •
                </span>
                <div className="flex items-center">
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Actions */}
            <div className="flex gap-3">
              <Link
                to={`/playlists/${playlist._id}`}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8V3a1 1 0 011-1h1a1 1 0 011 1v3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  View Playlist
                </div>
              </Link>

              <button
                onClick={() => setShowVideoSelectionModal(true)}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditForm(true)}
                disabled={loading}
                className={`flex-1 py-3 px-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </div>
              </button>

              {playlist.videos && playlist.videos.length > 0 && (
                <button
                  onClick={handleRemoveFirstVideo}
                  disabled={loading}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? "bg-orange-900/30 hover:bg-orange-900/50 text-orange-400"
                      : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <svg
                        className="w-3 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-2 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    )}
                    Remove
                  </div>
                </button>
              )}

              <button
                onClick={handleDeletePlaylist}
                disabled={loading}
                className={`py-3 px-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? "bg-red-900/30 hover:bg-red-900/50 text-red-400"
                    : "bg-red-100 hover:bg-red-200 text-red-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Selection Modal */}
      <VideoSelectionModal
        isOpen={showVideoSelectionModal}
        onClose={() => setShowVideoSelectionModal(false)}
        onSelectVideo={handleVideoSelection}
        token={token}
      />
    </>
  );
}
