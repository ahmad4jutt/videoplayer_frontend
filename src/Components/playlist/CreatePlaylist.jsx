// src/components/playlist/CreatePlaylistPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import { createPlaylist } from "../../services/api";

export default function CreatePlaylistPage() {
  const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const playlistData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPublic: formData.isPublic,
        // Don't send userId - let the backend get it from auth token
        // Don't send videos - let the schema default to empty array
      };

      await createPlaylist(token, playlistData);
      navigate("/playlists");
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create playlist. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/playlists");
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className={`flex items-center mb-4 transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-100"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Playlists
          </button>
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Create New Playlist
          </h1>
          <p
            className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Organize your favorite videos into a custom playlist
          </p>
        </div>

        {/* Form */}
        <div
          className={`rounded-lg shadow-md p-6 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div
                className={`border rounded-lg p-4 ${
                  isDarkMode
                    ? "bg-red-900/20 border-red-800"
                    : "bg-red-50 border-red-200"
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
                  <span
                    className={isDarkMode ? "text-red-300" : "text-red-700"}
                  >
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Playlist Name */}
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Playlist Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter playlist name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell people what your playlist is about (optional)"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Privacy Settings */}
            <div
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Privacy Settings
              </h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                    isDarkMode
                      ? "border-gray-500 bg-gray-600"
                      : "border-gray-300 bg-white"
                  }`}
                />
                <label
                  htmlFor="isPublic"
                  className={`ml-2 block text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Make this playlist public
                </label>
              </div>
              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {formData.isPublic
                  ? "Anyone can view this playlist"
                  : "Only you can view this playlist"}
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
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
                    Creating...
                  </>
                ) : (
                  <>
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Playlist
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className={`px-6 py-2 border rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div
          className={`mt-8 border rounded-lg p-4 ${
            isDarkMode
              ? "bg-blue-900/20 border-blue-800"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-start">
            <svg
              className={`w-5 h-5 mr-3 mt-0.5 ${
                isDarkMode ? "text-blue-400" : "text-blue-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4
                className={`text-sm font-medium ${
                  isDarkMode ? "text-blue-300" : "text-blue-900"
                }`}
              >
                Getting Started
              </h4>
              <p
                className={`text-sm mt-1 ${
                  isDarkMode ? "text-blue-400" : "text-blue-700"
                }`}
              >
                After creating your playlist, you can add videos to it from any
                video page by clicking the "Add to Playlist" button.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
