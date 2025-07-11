import React, { useState, useEffect } from "react";
import { Play, Eye, Calendar, Clock } from "lucide-react";
import { getChannelVideo } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
// Mock API function - replace with your actual API call

const ChannelVideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchChannelVideos();
  }, []);
  const { token } = useAuth();
  const fetchChannelVideos = async () => {
    try {
      setLoading(true);
      // Replace 'your-token' with actual token from your auth system
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

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchChannelVideos}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Details */}
      <div className="bg-white shadow-sm border-b">
        {/* Cover Image */}
        {videos.length > 0 && videos[0].owner.coverImage && (
          <div className="h-48 md:h-64 lg:h-80 relative overflow-hidden">
            <img
              src={videos[0].owner.coverImage}
              alt="Channel Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}

        {/* User Profile Section */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {videos.length > 0 && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={videos[0].owner.avatar}
                  alt={videos[0].owner.fullName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white  object-cover object-center"
                  loading="eager"
                  style={{ imageRendering: "auto" }}
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {videos[0].owner.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {videos
                      .reduce((total, video) => total + video.views, 0)
                      .toLocaleString()}{" "}
                    total views
                  </span>
                  <span className="flex items-center">
                    📹 {videos.length}{" "}
                    {videos.length === 1 ? "video" : "videos"}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined{" "}
                    {formatDate(
                      videos[0].owner.createdAt || videos[0].createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Channel Videos Title */}
          <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Videos
            </h2>
            <p className="text-gray-600">
              {videos.length} {videos.length === 1 ? "video" : "videos"}{" "}
              uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📹</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500">
              No videos have been uploaded to this channel yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleVideoClick(video)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={video.thumbnail.url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                    <Play className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200 w-12 h-12" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Owner Info */}
                  <div className="flex items-center mb-3">
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.fullName}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="text-gray-700 text-sm font-medium">
                      {video.owner.fullName}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatViews(video.views)} views
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(video.createdAt)}
                    </div>
                  </div>

                  {/* Published Status */}
                  {/* {video.isPublished && (
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Published
                      </span>
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
              <button
                onClick={closeVideoPlayer}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <video
                src={selectedVideo.videoFile.url}
                controls
                className="w-full aspect-video mb-4"
                autoPlay
              />
              <div className="space-y-2">
                <p className="text-gray-700">{selectedVideo.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {formatViews(selectedVideo.views)} views
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(selectedVideo.duration)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(selectedVideo.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelVideoPage;
