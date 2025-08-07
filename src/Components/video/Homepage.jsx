import React, { useEffect, useState } from "react";
import {
  getAllVideos,
  addToWatchHistory,
  getPublicSettings,
} from "../../services/api";
import VideoCard from "../../cards/VideoCard";
import { useAuth } from "../../hooks/UseAuth";
import { useSearch } from "../../context/SearchContext";
import { useTheme } from "../../context/ThemeContext";
import { AlertTriangle, Wrench, Clock } from "lucide-react";

const Homepage = () => {
  const { token } = useAuth();
  const { activeSearchQuery, filterVideos, searchType } = useSearch();
  const { isDarkMode } = useTheme();
  const [videos, setVideos] = useState([]);
  const [displayedVideos, setDisplayedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [scheduledMaintenance, setScheduledMaintenance] = useState(null);

  // Site settings state
  const [siteName, setSiteName] = useState("Vidzio");
  const [siteDescription, setSiteDescription] = useState(
    "Discover amazing content"
  );

  // Available categories based on your schema
  const categories = [
    "All",
    "Education",
    "Entertainment",
    "Music",
    "Gaming",
    "Sports",
    "Technology",
    "Travel",
    "Food",
    "Lifestyle",
    "News",
    "Comedy",
    "Tutorial",
    "Review",
    "Vlog",
    "Documentary",
    "Animation",
    "Art",
    "Science",
    "Health",
    "Business",
    "Other",
  ];

  // Fetch settings to check maintenance mode and site info
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getPublicSettings();
        const settings = response.data.data;

        // Set general site settings
        if (settings.general) {
          setSiteName(settings.general.siteName || "Vidzio");
          setSiteDescription(
            settings.general.siteDescription || "Discover amazing content"
          );
        }

        // Set maintenance settings
        if (settings.maintenance) {
          setMaintenanceMode(settings.maintenance.maintenanceMode || false);
          setMaintenanceMessage(
            settings.maintenance.maintenanceMessage ||
              "We are currently under maintenance. Please check back later."
          );
          setScheduledMaintenance(settings.maintenance.scheduledMaintenance);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // Continue loading even if settings fetch fails
      }
    };

    fetchSettings();
  }, []);

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
        const apiData = response.data.data;
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

  // Filter videos based on active search query and selected category
  useEffect(() => {
    if (videos.length > 0) {
      let filtered = videos;

      // Filter by category first
      if (selectedCategory !== "All") {
        filtered = filtered.filter(
          (video) => video.category === selectedCategory
        );
      }

      // Then apply search filter (only if there's an active search and we're searching videos)
      if (activeSearchQuery && searchType === "videos") {
        filtered = filterVideos(filtered, activeSearchQuery);
      }

      setDisplayedVideos(filtered);
    } else {
      setDisplayedVideos([]);
    }
  }, [activeSearchQuery, videos, filterVideos, selectedCategory, searchType]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleVideoClick = async (videoId) => {
    // Don't allow video clicks during maintenance mode
    if (maintenanceMode) {
      return;
    }

    if (!token) {
      console.warn("No token available for watch history");
      return;
    }

    if (!videoId) {
      console.warn("No video ID provided");
      return;
    }

    try {
      try {
        await addToWatchHistory(token, videoId);
        return;
      } catch (error) {
        console.log(error.response?.status, error.response?.data);
      }
    } catch (error) {
      console.error("Failed to add to watch history:", error);
    }
  };

  // Get video count for each category
  const getCategoryCount = (category) => {
    if (category === "All") return videos.length;
    return videos.filter((video) => video.category === category).length;
  };

  // Check if we should show search results message
  const isSearchActive = activeSearchQuery && searchType === "videos";
  const hasSearchResults = isSearchActive && displayedVideos.length > 0;
  const hasNoSearchResults = isSearchActive && displayedVideos.length === 0;

  // Maintenance Mode Banner Component (Compact)
  const MaintenanceBanner = () => {
    if (!maintenanceMode) return null;

    return (
      <div
        className={`mb-4 ${
          isDarkMode ? "bg-yellow-900/40" : "bg-yellow-50"
        } border-l-4 border-yellow-400 rounded-lg overflow-hidden shadow-sm`}
      >
        <div className="px-4 py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Wrench
                className={`h-5 w-5 ${
                  isDarkMode ? "text-yellow-300" : "text-yellow-600"
                }`}
              />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-yellow-200" : "text-yellow-800"
                    }`}
                  >
                    🚧 Maintenance Mode Active
                  </span>
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-yellow-300" : "text-yellow-700"
                    }`}
                  >
                    - {maintenanceMessage}
                  </span>
                </div>
                {scheduledMaintenance && (
                  <div className="flex items-center text-xs">
                    <Clock
                      className={`h-3 w-3 mr-1 ${
                        isDarkMode ? "text-yellow-300" : "text-yellow-600"
                      }`}
                    />
                    <span
                      className={`${
                        isDarkMode ? "text-yellow-300" : "text-yellow-600"
                      }`}
                    >
                      {new Date(scheduledMaintenance).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thin animated maintenance pattern */}
        <div
          className={`h-1 ${
            isDarkMode ? "bg-yellow-800" : "bg-yellow-200"
          } relative overflow-hidden`}
        >
          <div
            className={`absolute inset-0 ${
              isDarkMode ? "bg-yellow-600" : "bg-yellow-400"
            } transform -skew-x-12 animate-pulse`}
          ></div>
        </div>
      </div>
    );
  };

  // Loading state
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
          {/* Show maintenance banner even during loading if needed */}
          <MaintenanceBanner />

          <div className="text-center mb-8">
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } mb-2`}
            >
              <span className="text-red-600 text-4xl font-bold">
                {siteName.slice(0, 3)}
              </span>
              <span
                className={`${
                  isDarkMode ? "text-white" : "text-gray-800"
                } text-4xl font-bold`}
              >
                {siteName.slice(3)}
              </span>
            </h1>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {siteDescription}
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

  // Error state
  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <MaintenanceBanner />

          <div className="flex items-center justify-center">
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
                className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                } mb-4`}
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
        </div>
      </div>
    );
  }

  // No videos state
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
              <span className="text-red-600 text-4xl font-bold">
                {siteName.slice(0, 3)}
              </span>
              <span
                className={`${
                  isDarkMode ? "text-white" : "text-gray-800"
                } text-4xl font-bold`}
              >
                {siteName.slice(3)}
              </span>
            </h1>
            <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {siteDescription}
            </p>
          </div>

          <MaintenanceBanner />

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

  // No search results state
  if (hasNoSearchResults) {
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
              } mb-4`}
            >
              <span className="text-red-600 text-4xl font-bold">
                {siteName.slice(0, 3)}
              </span>
              <span
                className={`${
                  isDarkMode ? "text-white" : "text-gray-800"
                } text-4xl font-bold`}
              >
                {siteName.slice(3)}
              </span>
            </h1>
          </div>

          <MaintenanceBanner />

          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2 min-w-max">
              {categories.map((category) => {
                const count = getCategoryCount(category);
                if (count === 0 && category !== "All") return null;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white shadow-lg"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
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
              No videos found for "{activeSearchQuery}"
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </h2>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mb-4`}
            >
              Try searching with different keywords or check your spelling
            </p>

            {/* Search suggestions */}
            <div className="max-w-md mx-auto">
              {selectedCategory !== "All" && (
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`mb-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Search in all categories
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No category results state
  if (
    selectedCategory !== "All" &&
    displayedVideos.length === 0 &&
    !isSearchActive
  ) {
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
              } mb-4`}
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
          </div>

          <MaintenanceBanner />

          {/* Category Filter */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2 min-w-max">
              {categories.map((category) => {
                const count = getCategoryCount(category);
                if (count === 0 && category !== "All") return null;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white shadow-lg transform scale-105"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center py-16">
            <div
              className={`${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              } text-8xl mb-6`}
            >
              📂
            </div>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              } mb-2`}
            >
              No videos found in {selectedCategory}
            </h2>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Try selecting a different category
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main content with videos (maintenance banner shows at top, videos display below)
  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Maintenance Banner - shows at the top */}
        <MaintenanceBanner />

        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className={`text-5xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-4`}
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
            {hasSearchResults
              ? `Search results for "${activeSearchQuery}"`
              : selectedCategory !== "All"
              ? `${selectedCategory} Videos`
              : siteDescription}
          </p>
        </div>

        {/* Category Filter - Hide when searching */}
        {!isSearchActive && (
          <div className="mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2 min-w-max">
              {categories.map((category) => {
                const count = getCategoryCount(category);
                if (count === 0 && category !== "All") return null;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white shadow-lg transform scale-105"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-center space-x-2">
          <span
            className={`${
              isDarkMode
                ? "bg-blue-900 text-blue-200"
                : "bg-blue-100 text-blue-800"
            } px-3 py-1 text-sm font-medium rounded`}
          >
            {displayedVideos.length}{" "}
            {displayedVideos.length === 1 ? "Video" : "Videos"}
            {hasSearchResults && ` found for "${activeSearchQuery}"`}
            {selectedCategory !== "All" &&
              !isSearchActive &&
              ` in ${selectedCategory}`}
          </span>
          {(hasSearchResults ||
            (selectedCategory !== "All" && !isSearchActive)) && (
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

        {/* Video Grid - Videos are displayed even in maintenance mode */}
        <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-1 sm:grid-cols-1 gap-6">
          {displayedVideos.map((video, index) => (
            <div
              key={video._id || video.id || index}
              onClick={() => handleVideoClick(video._id || video.id)}
              className={`transform transition-transform duration-200 ${
                maintenanceMode
                  ? "opacity-75 cursor-not-allowed hover:opacity-90"
                  : "hover:scale-105 cursor-pointer"
              }`}
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
