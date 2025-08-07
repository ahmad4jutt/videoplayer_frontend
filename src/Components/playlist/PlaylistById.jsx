import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play,
  Clock,
  Eye,
  User,
  Calendar,
  Share2,
  Heart,
  Download,
} from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { getPlaylistById } from "../../services/api";

const PlaylistById = () => {
  const { playlistId } = useParams();
  const { videoId } = useParams();
  const { isDarkMode } = useTheme();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [liked, setLiked] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!playlistId) {
      setError("Playlist ID is required");
      setLoading(false);
      return;
    }
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        const response = await getPlaylistById(token, playlistId);
        setPlaylist(response.data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch playlist");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [token, playlistId]);

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
  };

  const getTotalDuration = () => {
    // Add proper null/undefined checks
    if (
      !playlist?.videos ||
      !Array.isArray(playlist.videos) ||
      playlist.videos.length === 0
    ) {
      return "0:00";
    }

    let totalSeconds = 0;
    playlist.videos.forEach((video) => {
      // Handle both string and number duration formats
      if (video?.duration) {
        if (typeof video.duration === "number") {
          totalSeconds += video.duration;
        } else if (typeof video.duration === "string") {
          const [minutes, seconds] = video.duration.split(":").map(Number);
          totalSeconds += minutes * 60 + seconds;
        }
      }
    });

    return formatDuration(totalSeconds);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p
            className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Loading playlist...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p
            className={`font-medium mb-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Error loading playlist
          </p>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Add check for playlist existence
  if (!playlist) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Playlist not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div
          className={`rounded-xl shadow-sm overflow-hidden mb-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-800" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {playlist.name || "Untitled Playlist"}
                </h1>
                <p className="text-blue-100 mb-4 max-w-2xl">
                  {playlist.description || "No description available"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    <span>{playlist.videos?.length || 0} videos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{getTotalDuration()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Updated{" "}
                      {playlist.updatedAt
                        ? formatDate(playlist.updatedAt)
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        playlist.isPublic
                          ? "bg-green-500 bg-opacity-20 text-green-100"
                          : "bg-red-500 bg-opacity-20 text-red-100"
                      }`}
                    >
                      {playlist.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Info - Only show if owner data exists */}
          {playlist.owner && (
            <div
              className={`p-6 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={playlist.owner.avatar}
                    alt={playlist.owner.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3
                      className={`font-semibold ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {playlist.owner.fullName}
                    </h3>
                    <p
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      @{playlist.owner.userName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      liked
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
                    />
                    <span>{liked ? "Liked" : "Like"}</span>
                  </button>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Videos Grid */}
        <div
          className={`rounded-xl shadow-sm overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div
            className={`p-6 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Videos
            </h2>
          </div>
          {!playlist?.videos || playlist.videos.length === 0 ? (
            <div className="p-12 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <Play
                  className={`w-8 h-8 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                No videos yet
              </h3>
              <p
                className={`mb-6 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                This playlist is empty. Videos will appear here once they're
                added.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add Videos
              </button>
            </div>
          ) : (
            <div
              className={`divide-y ${
                isDarkMode ? "divide-gray-700" : "divide-gray-100"
              }`}
            >
              {playlist.videos.map((video, index) => (
                <Link key={video._id} to={`/video/${video._id}`}>
                  <div
                    key={video._id}
                    className={`p-6 transition-colors cursor-pointer ${
                      currentVideo === index
                        ? isDarkMode
                          ? "bg-blue-900/30 border-l-4 border-blue-500"
                          : "bg-blue-50 border-l-4 border-blue-600"
                        : isDarkMode
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setCurrentVideo(index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <span
                          className={`text-sm font-medium w-6 text-center ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-shrink-0 relative">
                        <img
                          src={video.thumbnail?.url || video.thumbnail}
                          alt={video.title}
                          className="w-40 h-24 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                          {formatDuration(video.duration)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white opacity-80" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium mb-1 truncate ${
                            isDarkMode ? "text-gray-100" : "text-gray-900"
                          }`}
                        >
                          {video.title}
                        </h3>
                        <p
                          className={`text-sm line-clamp-2 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {video.description}
                        </p>
                        <div
                          className={`flex items-center gap-4 mt-2 text-sm ${
                            isDarkMode ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{formatViews(video.views)} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistById;
