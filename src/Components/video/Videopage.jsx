import React, { useEffect, useState } from "react";
import {
  publishVideo,
  getChannelVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";

const Videopage = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null,
  });
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchVideos();
  }, [token]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching videos with token:",
        token ? "Token exists" : "No token"
      );
      const res = await getChannelVideo(token);
      console.log("Full API response:", res);
      console.log("Response data:", res.data);
      console.log("Response data type:", typeof res.data);
      console.log("Is response data an array?", Array.isArray(res.data));

      // Check different possible response structures
      let videosData = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          videosData = res.data;
        } else if (res.data.videos && Array.isArray(res.data.videos)) {
          videosData = res.data.videos;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          videosData = res.data.data;
        }
      }

      console.log("Processed videos data:", videosData);
      console.log("Number of videos:", videosData.length);

      if (videosData.length > 0) {
        console.log("First video structure:", videosData[0]);
        console.log("First video keys:", Object.keys(videosData[0]));
      }

      setVideos(videosData);
    } catch (error) {
      console.error("Error fetching videos:", error);
      console.error("Error response:", error.response);
      setError(
        `Failed to fetch videos: ${
          error.response?.data?.message || error.message
        }`
      );
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a video title");
      setLoading(false);
      return;
    }

    if (!form.videoFile) {
      setError("Please select a video file");
      setLoading(false);
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title.trim());
    fd.append("description", form.description.trim());

    if (form.videoFile) {
      console.log(
        "Adding video file:",
        form.videoFile.name,
        form.videoFile.type,
        form.videoFile.size
      );
      fd.append("videoFile", form.videoFile);
    }
    if (form.thumbnail) {
      console.log(
        "Adding thumbnail:",
        form.thumbnail.name,
        form.thumbnail.type,
        form.thumbnail.size
      );
      fd.append("thumbnail", form.thumbnail);
    }

    console.log("FormData contents:");
    for (let [key, value] of fd.entries()) {
      console.log(key, value);
    }

    try {
      console.log(
        "Publishing video with token:",
        token ? "Token exists" : "No token"
      );
      const response = await publishVideo(token, fd);
      console.log("Publish video response:", response);
      await fetchVideos();
      setForm({
        title: "",
        description: "",
        videoFile: null,
        thumbnail: null,
      });
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => (input.value = ""));
    } catch (error) {
      console.error("Error publishing video:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      let errorMessage = "Failed to upload video";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 413) {
        errorMessage =
          "File size too large. Please choose a smaller video file.";
      } else if (error.response?.status === 415) {
        errorMessage =
          "Unsupported file type. Please upload a valid video file.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.response?.status === 500) {
        errorMessage =
          "Server error. Please try again later or contact support.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video._id || video.id);
    setEditForm({
      title: video.title || "",
      description: video.description || "",
    });
  };

  const handleUpdateVideo = async (videoId) => {
    try {
      setLoading(true);
      console.log("Updating video:", videoId, editForm);
      await updateVideo(token, videoId, editForm);
      await fetchVideos();
      setEditingVideo(null);
      setEditForm({ title: "", description: "" });
    } catch (error) {
      console.error("Error updating video:", error);
      console.error("Error response:", error.response);
      setError(
        `Failed to update video: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (videoId) => {
    try {
      setLoading(true);
      console.log("Toggling publish status for video:", videoId);
      await togglePublishStatus(token, videoId);
      await fetchVideos();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      console.error("Error response:", error.response);
      setError(
        `Failed to toggle publish status: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        setLoading(true);
        console.log("Deleting video:", videoId);
        await deleteVideo(token, videoId);
        await fetchVideos();
      } catch (error) {
        console.error("Error deleting video:", error);
        console.error("Error response:", error.response);
        setError(
          `Failed to delete video: ${
            error.response?.data?.message || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Video Management
          </h1>
          <p className="text-gray-600 mt-2">
            Upload and manage your video content
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 ml-4">
              Upload New Video
            </h2>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  placeholder="Enter video title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video File
                </label>
                <input
                  name="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={onFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter video description..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thumbnail
              </label>
              <input
                name="thumbnail"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                "Publish Video"
              )}
            </button>
          </form>
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 ml-4">
              Your Videos
            </h2>
            <div className="ml-auto">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {videos.length} videos
              </span>
            </div>
          </div>

          {loading && !videos.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading videos...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
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
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No videos yet
              </h3>
              <p className="text-gray-500">
                Upload your first video to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {videos.map((video, index) => {
                // Use a more flexible approach to get video ID
                const videoId = video._id || video.id || `video-${index}`;
                const videoTitle =
                  video.title || video.name || `Video ${index + 1}`;
                const videoDescription = video.description || video.desc || "";
                const isPublished =
                  video.published !== undefined
                    ? video.published
                    : video.isPublished;
                const createdDate =
                  video.createdAt || video.created_at || video.uploadDate;

                return (
                  <div
                    key={videoId}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-gray-50 to-white"
                  >
                    {editingVideo === videoId ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Video title"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows="3"
                          placeholder="Video description"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateVideo(videoId)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingVideo(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {videoTitle}
                            </h3>
                            {videoDescription && (
                              <p className="text-gray-600 mb-3">
                                {videoDescription}
                              </p>
                            )}
                            <div className="flex items-center gap-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  isPublished
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {isPublished ? "Published" : "Draft"}
                              </span>
                              {createdDate && (
                                <span className="text-sm text-gray-500">
                                  {new Date(createdDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleEdit(video)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>

                          <button
                            onClick={() => handleTogglePublish(videoId)}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${
                              isPublished
                                ? "bg-orange-600 text-white hover:bg-orange-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {isPublished ? (
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
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                  />
                                </svg>
                                Unpublish
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Publish
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(videoId)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videopage;
