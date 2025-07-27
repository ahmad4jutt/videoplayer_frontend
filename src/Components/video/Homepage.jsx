import React, { useEffect, useState } from "react";
import { getAllVideos, addToWatchHistory } from "../../services/api";
import VideoCard from "../../cards/VideoCard";
import { useAuth } from "../../hooks/UseAuth";
import { useSearch } from "../../context/SearchContext";
import { useTheme } from "../../context/ThemeContext";

const Homepage = () => {
  const { token } = useAuth();
  const { searchQuery, filterVideos } = useSearch();
  const { isDarkMode } = useTheme();
  const [videos, setVideos] = useState([]);
  const [displayedVideos, setDisplayedVideos] = useState([]);
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
        const apiData = response.data.data;
        console.log("extract api data", apiData);
        const videoData = apiData?.videos || apiData || [];

        if (Array.isArray(videoData)) {
          setVideos(videoData);
          setDisplayedVideos(videoData);
        } else {
          console.error("Expected array but got:", typeof videoData, videoData);
          setVideos([]);
          setDisplayedVideos([]);
          setError("Invalid data format received from server");
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        setError(error.response?.data?.message || "Failed to load videos");
        setVideos([]);
        setDisplayedVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [token]);

  useEffect(() => {
    if (videos.length > 0) {
      const filtered = filterVideos(videos, searchQuery);
      setDisplayedVideos(filtered);
    }
  }, [searchQuery, videos, filterVideos]);

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
      console.log("Attempting to add to watch history...");

      try {
        await addToWatchHistory(token, videoId);
        console.log("✅ Method 1 successful: POST /history/:videoId");
        return;
      } catch (error) {
        console.log(error.response?.status, error.response?.data);
      }
    } catch (error) {
      console.error("Failed to add to watch history:", error);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } mb-2`}
            >
              Video Hub
            </h1>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Discover amazing content
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg overflow-hidden animate-pulse`}
              >
                <div
                  className={`${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } h-48 w-full`}
                ></div>
                <div className="p-4">
                  <div
                    className={`h-4 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-300"
                    } rounded mb-2`}
                  ></div>
                  <div
                    className={`h-3 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-300"
                    } rounded w-3/4`}
                  ></div>
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
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-gray-100"
        } flex items-center justify-center`}
      >
        <div
          className={`text-center p-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl shadow-lg max-w-md mx-4`}
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-2`}
          >
            Oops!
          </h2>
          <p
            className={`${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-4`}
          >
            {error}
          </p>
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
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } mb-2`}
            >
              Video Hub
            </h1>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Discover amazing content
            </p>
          </div>

          <div className="text-center py-16">
            <div
              className={`${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              } text-8xl mb-6`}
            >
              📹
            </div>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              } mb-2`}
            >
              No Videos Found
            </h2>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Be the first to upload a video!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (searchQuery && displayedVideos.length === 0) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1
              className={`text-5xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text`}
            >
              <span className="text-red-600 text-4xl font-bold">Vid</span>
              <span
                className={`${
                  isDarkMode ? "text-white" : "text-gray-800"
                } text-4xl font-bold`}
              >
                zio
              </span>
            </h1>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } max-w-2xl mx-auto`}
            >
              Search Results
            </p>
          </div>

          <div className="text-center py-16">
            <div
              className={`${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              } text-8xl mb-6`}
            >
              🔍
            </div>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              } mb-2`}
            >
              No videos found for "{searchQuery}"
            </h2>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Try searching with different keywords
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-5xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
          >
            <span className="text-red-600 text-4xl font-bold">Vid</span>
            <span
              className={`${
                isDarkMode ? "text-white" : "text-gray-800"
              } text-4xl font-bold`}
            >
              zio
            </span>
          </h1>
          <p
            className={`text-xl ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } max-w-2xl mx-auto`}
          >
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Discover, watch, and enjoy amazing content from creators around the world"}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <span
              className={`${
                isDarkMode
                  ? "bg-blue-900 text-blue-200"
                  : "bg-blue-100 text-blue-800"
              } px-3 py-1 text-sm font-medium rounded`}
            >
              {displayedVideos.length}{" "}
              {displayedVideos.length === 1 ? "Video" : "Videos"}
              {searchQuery && ` found for "${searchQuery}"`}
            </span>
            {searchQuery && (
              <span
                className={`${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                } px-3 py-1 text-sm font-medium rounded`}
              >
                out of {videos.length} total
              </span>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-1 sm:grid-cols-1 gap-6">
          {displayedVideos.map((video, index) => (
            <div
              key={video._id || video.id || index}
              onClick={() => handleVideoClick(video._id || video.id)}
            >
              <VideoCard video={video} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`text-center mt-16 pt-8 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Enjoying the content? Share with your friends! 🎬
          </p>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
