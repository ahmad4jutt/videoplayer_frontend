// src/components/playlist/PlaylistPage.jsx
import { useEffect, useState } from "react";
import { getUserPlaylists } from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import PlaylistCard from "./PlaylistCard";

export default function PlaylistPage() {
  const { token, currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("=== FETCHING PLAYLISTS ===");
      console.log("Token:", token);
      console.log("Current User ID:", currentUser._id);
      console.log("Making API call to getUserPlaylists...");

      const res = await getUserPlaylists(token, currentUser._id);

      console.log("=== API RESPONSE ===");
      console.log("Full response:", res);
      console.log("Response data:", res.data);
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      // Handle different possible response structures
      let playlistData = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          playlistData = res.data;
        } else if (res.data.playlists && Array.isArray(res.data.playlists)) {
          playlistData = res.data.playlists;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          playlistData = res.data.data;
        }
      }

      console.log("Processed playlist data:", playlistData);
      console.log("Number of playlists:", playlistData.length);

      setLists(playlistData);
    } catch (err) {
      console.error("=== ERROR FETCHING PLAYLISTS ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      setError("Failed to load playlists");
      setLists([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentUser?._id) {
      console.log("Fetching playlists for user:", currentUser._id);
      fetchPlaylists();
    } else {
      console.log("Missing token or user ID:", {
        token: !!token,
        userId: currentUser?._id,
      });
    }
  }, [token, currentUser]);

  const refresh = () => {
    fetchPlaylists();
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen p-6 ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div
              className={`h-8 rounded w-1/4 mb-6 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-32 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            My Playlists
          </h1>
          <Link
            to="/playlists/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
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
            Create New Playlist
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div
            className={`border rounded-lg p-4 mb-6 ${
              isDarkMode
                ? "bg-red-900/20 border-red-800 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center">
              <svg
                className={`w-5 h-5 mr-2 ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={refresh}
              className={`mt-2 font-medium hover:underline ${
                isDarkMode
                  ? "text-red-400 hover:text-red-300"
                  : "text-red-600 hover:text-red-800"
              }`}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && lists.length === 0 && (
          <div className="text-center py-12">
            <svg
              className={`mx-auto h-12 w-12 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3
              className={`mt-2 text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              No playlists
            </h3>
            <p
              className={`mt-1 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Get started by creating a new playlist.
            </p>
            <div className="mt-6">
              <Link
                to="/playlists/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Create Playlist
              </Link>
            </div>
          </div>
        )}

        {/* Playlists Grid */}
        {!loading && !error && lists.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onRefresh={refresh}
                token={token}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
