import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAllVideos, addToWatchHistory } from "../../services/api";
import VideoCard from "../../cards/VideoCard";
import { useAuth } from "../../hooks/UseAuth";

const Homepage = () => {
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(false);
        const response = await getAllVideos(token);
        console.log("api response ", response);
        const apiData = response.data.data; // first data is axios second one from api wrapper
        console.log("extract api data", apiData);
        const videoData = apiData?.videos || apiData || [];

        //ensure we have array
        if (Array.isArray(videoData)) {
          setVideos(videoData);
        } else {
          console.error("Expected array but got:", typeof videoData, videoData);
          setVideos([]);
          setError("Invalid data format received from server");
        }
      } catch (error) {
        console.error("Error fetching videos:", error); // Fixed: was 'err' instead of 'error'
        setError(error.response?.data?.message || "Failed to load videos"); // Fixed: was 'err' instead of 'error'
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [token]);

  // Handle video click to add to watch history
  const handleVideoClick = async (videoId) => {
    console.log("Video clicked:", videoId);

    if (!token) {
      console.warn("No token available for watch history");
      return;
    }

    if (!videoId) {
      console.warn("No video ID provided");
      return;
    }

    try {
      // Try multiple API variations to find the correct one
      console.log("Attempting to add to watch history...");

      // Method 1: Original POST with videoId in URL
      try {
        await addToWatchHistory(token, videoId);
        console.log("✅ Method 1 successful: POST /history/:videoId");
        return;
      } catch (error) {
        console.log(
          "❌ Method 1 failed:",
          error.response?.status,
          error.response?.data
        );
      }

      // Method 2: POST with videoId in body
      try {
        const response = await axios.post(
          `${
            process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1"
          }/users/history`,
          { videoId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Method 2 successful: POST /history with body");
        return;
      } catch (error) {
        console.log(
          "❌ Method 2 failed:",
          error.response?.status,
          error.response?.data
        );
      }

      // Method 3: PUT request
      try {
        const response = await axios.put(
          `${
            process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1"
          }/users/history/${videoId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Method 3 successful: PUT /history/:videoId");
        return;
      } catch (error) {
        console.log(
          "❌ Method 3 failed:",
          error.response?.status,
          error.response?.data
        );
      }

      // Method 4: PATCH request
      try {
        const response = await axios.patch(
          `${
            process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api/v1"
          }/users/history/${videoId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Method 4 successful: PATCH /history/:videoId");
        return;
      } catch (error) {
        console.log(
          "❌ Method 4 failed:",
          error.response?.status,
          error.response?.data
        );
      }

      console.error("❌ All methods failed. Check your backend API endpoint.");
    } catch (error) {
      console.error("Failed to add to watch history:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Video Hub</h1>
            <p className="text-gray-600">Discover amazing content</p>
          </div>

          {/* Loading skeleton */}
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="bg-gray-300 h-48 w-full"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Video Hub</h1>
            <p className="text-gray-600">Discover amazing content</p>
          </div>

          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">📹</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No Videos Found
            </h2>
            <p className="text-gray-500">Be the first to upload a video!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Video Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover, watch, and enjoy amazing content from creators around the
            world
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">
              {videos.length} {videos.length === 1 ? "Video" : "Videos"}
            </span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <div
              key={video._id || video.id || index}
              className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              onClick={() => handleVideoClick(video._id || video.id)}
            >
              <VideoCard video={video} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            Enjoying the content? Share with your friends! 🎬
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
