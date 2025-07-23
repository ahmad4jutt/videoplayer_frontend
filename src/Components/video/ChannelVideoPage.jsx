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
  X,
  ChevronRight,
} from "lucide-react";
import { getChannelVideo } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";

const ChannelVideoPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);

  useEffect(() => {
    fetchChannelVideos();
  }, []);

  const { token } = useAuth();

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
    document.body.style.overflow = "hidden";
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
    document.body.style.overflow = "unset";
  };

  const totalViews = videos.reduce((total, video) => total + video.views, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading your content
          </h3>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md mx-auto">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Something went wrong
          </h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchChannelVideos}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with User Details */}
      <div className="relative">
        {/* Cover Image */}
        {videos.length > 0 && videos[0].owner.coverImage && (
          <div className="h-64 md:h-80 lg:h-96 relative overflow-hidden">
            <img
              src={videos[0].owner.coverImage}
              alt="Channel Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Action buttons */}
            <div className="absolute top-6 right-6 flex space-x-3">
              <button className="p-3 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 text-white hover:bg-black/70 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-black/50 backdrop-blur-sm rounded-full border border-white/20 text-white hover:bg-black/70 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* User Profile Section */}
        <div className="relative -mt-16 z-10">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {videos.length > 0 && (
              <div className="flex flex-col md:flex-row items-start md:items-end gap-8 mb-12">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={videos[0].owner.avatar}
                    alt={videos[0].owner.fullName}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {videos[0].owner.fullName}
                  </h1>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                          <Eye className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {totalViews.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-300">
                            Total Views
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                          <Play className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {videos.length}
                          </div>
                          <div className="text-sm text-gray-300">
                            {videos.length === 1 ? "Video" : "Videos"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-600/20 rounded-lg">
                          <Calendar className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">
                            {formatDate(
                              videos[0].owner.createdAt || videos[0].createdAt
                            )}
                          </div>
                          <div className="text-sm text-gray-300">Joined</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Header */}
            <div className="border-t border-gray-700 pt-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                Latest Videos
                <ChevronRight className="w-8 h-8 text-gray-400 ml-2" />
              </h2>
              <p className="text-gray-400">
                {videos.length} {videos.length === 1 ? "video" : "videos"}{" "}
                available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500 text-8xl mb-8">📹</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              No videos yet
            </h3>
            <p className="text-gray-400 text-lg">
              This channel hasn't uploaded any content yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="group cursor-pointer"
                onClick={() => handleVideoClick(video)}
                onMouseEnter={() => setHoveredVideo(video._id)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors shadow-lg">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail.url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`transform transition-all duration-200 ${
                          hoveredVideo === video._id
                            ? "scale-100 opacity-100"
                            : "scale-75 opacity-0"
                        }`}
                      >
                        <div className="p-4 bg-white/90 rounded-full shadow-xl">
                          <Play className="w-8 h-8 text-gray-800 fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                      {formatDuration(video.duration)}
                    </div>

                    {/* View count badge */}
                    <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      <Eye className="w-3 h-3 inline mr-1" />
                      {formatViews(video.views)}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-5">
                    <h3 className="font-semibold text-white mb-3 line-clamp-2 text-lg">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {video.description}
                    </p>

                    {/* Owner Info */}
                    <div className="flex items-center mb-4">
                      <img
                        src={video.owner.avatar}
                        alt={video.owner.fullName}
                        className="w-10 h-10 rounded-full mr-3 border-2 border-gray-600"
                      />
                      <span className="text-gray-300 text-sm font-medium">
                        {video.owner.fullName}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {formatViews(video.views)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(video.createdAt)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-red-400">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-blue-400">
                          <Share2 className="w-4 h-4" />
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

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white line-clamp-1">
                {selectedVideo.title}
              </h2>
              <button
                onClick={closeVideoPlayer}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-100px)] overflow-auto">
              <video
                src={selectedVideo.videoFile.url}
                controls
                className="w-full aspect-video rounded-xl mb-6 shadow-xl"
                autoPlay
              />

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {selectedVideo.description}
                  </p>

                  {/* Owner info in modal */}
                  <div className="flex items-center p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                    <img
                      src={selectedVideo.owner.avatar}
                      alt={selectedVideo.owner.fullName}
                      className="w-16 h-16 rounded-full mr-4 border-2 border-gray-500"
                    />
                    <div>
                      <h4 className="text-white font-bold text-lg">
                        {selectedVideo.owner.fullName}
                      </h4>
                      <p className="text-gray-400">Content Creator</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Stats cards */}
                  <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-blue-400" />
                        Views
                      </div>
                      <span className="font-bold text-xl">
                        {formatViews(selectedVideo.views)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-600/20 rounded-xl border border-green-500/30">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-green-400" />
                        Duration
                      </div>
                      <span className="font-bold text-xl">
                        {formatDuration(selectedVideo.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-600/20 rounded-xl border border-orange-500/30">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-orange-400" />
                        Published
                      </div>
                      <span className="font-bold">
                        {formatDate(selectedVideo.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-3 pt-4">
                    <button className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Like Video
                    </button>
                    <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center">
                      <Share2 className="w-5 h-5 mr-2" />
                      Share Video
                    </button>
                    <button className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center">
                      <Download className="w-5 h-5 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ChannelVideoPage;
