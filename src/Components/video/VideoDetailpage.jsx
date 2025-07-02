import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getVideoById,
  toggleVideoLike,
  getVideoWithLikeStatus,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  toggleSubscription,
  getSubscribedChannels,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import {
  Eye,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Flag,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  MoreHorizontal,
  MessageCircle,
  Edit,
  Trash2,
  Send,
  X,
} from "lucide-react";

const VideoDetailpage = () => {
  const { videoId } = useParams();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  // Video states
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  // Likes states - FIXED: Simplified state management
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [likesLoading, setLikesLoading] = useState(false);
  const [likeError, setLikeError] = useState(null);

  // Comments states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // Subscription states
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);

  // NEW: Fetch video like status function
  const fetchVideoLike = async (e) => {
    try {
      console.log("Fetching like status for video:", videoId);
      const response = await getVideoWithLikeStatus(token, videoId);
      console.log("Full API response:", response.data);

      // Extract video data from the response
      const videoData = response.data?.data;

      if (!videoData) {
        console.warn("No video data found in response");
        setLiked(false);
        setLikeCount(0);
        return {
          liked: false,
          likeCount: 0,
        };
      }

      console.log("Video data:", videoData);

      // Extract like status and count from the API response
      const isLiked = videoData.isLikedByUser || false;
      const likeCount = videoData.likesCount || 0;

      console.log(`Video ${videoId} is liked:`, isLiked);
      console.log(`Video ${videoId} like count:`, likeCount);

      setLiked(false);
      return {
        liked: isLiked,
        likeCount: likeCount,
      };
    } catch (error) {
      console.error("Error fetching video like status:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      setLiked(false);
      return {
        liked: false,
        likeCount: 0,
      };
    }
  };

  // Alternative: More robust version with additional debugging
  const fetchVideoLikeWithDebug = async () => {
    try {
      console.log("=== FETCHING LIKE STATUS ===");
      console.log("Video ID:", videoId);
      console.log("Token exists:", !!token);

      const response = await axios.get(`${base_url}/api/user/liked-videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("=== API RESPONSE DEBUG ===");
      console.log("Status:", response.status);
      console.log("Response data type:", typeof response.data);
      console.log("Response data:", response.data);

      // More comprehensive response parsing
      const parseResponseData = (data) => {
        // Log the structure for debugging
        console.log("Parsing data structure:");
        console.log("- data.data exists:", !!data.data);
        console.log("- data.data type:", typeof data.data);
        console.log("- data.videos exists:", !!data.videos);
        console.log("- data is array:", Array.isArray(data));

        // Try multiple possible structures
        const possibleArrays = [
          data.data?.videos,
          data.data?.likedVideos,
          data.data,
          data.videos,
          data.likedVideos,
          data,
        ];

        for (let i = 0; i < possibleArrays.length; i++) {
          const candidate = possibleArrays[i];
          if (Array.isArray(candidate)) {
            console.log(
              `Found array at position ${i}:`,
              candidate.length,
              "items"
            );
            return candidate;
          }
        }

        console.warn("No array found in response data");
        return [];
      };

      const likedVideosArray = parseResponseData(response.data);

      console.log("=== PROCESSING RESULTS ===");
      console.log("Final array:", likedVideosArray);
      console.log("Array length:", likedVideosArray.length);

      if (likedVideosArray.length > 0) {
        console.log("Sample video object:", likedVideosArray[0]);
      }

      // Check if video is liked
      const isLiked = likedVideosArray.some((video) => {
        const matches =
          video._id === videoId ||
          video.id === videoId ||
          video.videoId === videoId;
        if (matches) {
          console.log("Found matching video:", video);
        }
        return matches;
      });

      console.log("=== FINAL RESULT ===");
      console.log("Is video liked:", isLiked);

      setLiked(isLiked);
      return {
        liked: isLiked,
        likeCount: video?.likesCount || video?.likes || 0,
      };
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      setLiked(false);
      return {
        liked: false,
        likeCount: video?.likesCount || video?.likes || 0,
      };
    }
  };

  // NEW: Fetch comment likes function
  const fetchCommentLikes = async (comments) => {
    if (!token || !comments || comments.length === 0) return comments;

    try {
      const processedComments = await Promise.all(
        comments.map(async (comment) => {
          try {
            return {
              ...comment,
              likesCount: comment.likesCount || 0,
              isLiked: comment.isLiked || false,
            };
          } catch (err) {
            console.error(
              `Error fetching likes for comment ${comment._id}:`,
              err
            );
            return {
              ...comment,
              likesCount: comment.likesCount || 0,
              isLiked: false,
            };
          }
        })
      );

      return processedComments;
    } catch (err) {
      console.error("Error fetching comment likes:", err);
      return comments.map((comment) => ({
        ...comment,
        likesCount: comment.likesCount || 0,
        isLiked: false,
      }));
    }
  };

  // ENHANCED: Fetch video data with separate like status fetch
  const fetchVideoData = async () => {
    if (!token || !videoId) {
      setLoading(false);
      setError("Missing authentication or video ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching video data for ID:", videoId);

      // Get video details
      const videoResponse = await getVideoById(token, videoId);
      console.log("Video response:", videoResponse);

      let videoData = null;
      if (videoResponse?.data?.data) {
        videoData = videoResponse.data.data;
      } else if (videoResponse?.data) {
        videoData = videoResponse.data;
      }

      if (!videoData) {
        setError("Video not found");
        return;
      }

      setVideo(videoData);

      // Set initial like count from video response
      const initialLikeCount = videoData.likesCount || videoData.likes || 0;
      setLikeCount(initialLikeCount);
      console.log("Initial like count:", initialLikeCount);

      // Always fetch like status separately for accuracy
      console.log("Fetching like status...");
      const likeStatus = await fetchVideoLike(videoId);
      console.log("Like status result:", likeStatus);

      setLiked(likeStatus.liked);

      // Fetch subscription status
      if (currentUser?.data?._id && videoData.owner?._id) {
        fetchSubscriptionStatus(videoData.owner._id);
      }
    } catch (err) {
      console.error("Error fetching video:", err);
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Improved comment fetching with like status
  const fetchVideoComments = async () => {
    if (!token || !videoId || commentsLoading) return;

    try {
      setCommentsLoading(true);
      setCommentsError(null);

      const response = await getComments(token, videoId);
      console.log("Comments response:", response);

      let commentsData = [];
      if (response?.data?.comments && Array.isArray(response.data.comments)) {
        commentsData = response.data.comments;
      } else if (
        response?.data?.data?.comments &&
        Array.isArray(response.data.data.comments)
      ) {
        commentsData = response.data.data.comments;
      }

      // NEW: Fetch comment likes
      const commentsWithLikes = await fetchCommentLikes(commentsData);
      setComments(commentsWithLikes);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setCommentsError("Failed to load comments");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // NEW: Refresh video like status
  const refreshVideoLikeStatus = async () => {
    if (!token || !videoId) return;

    try {
      console.log("Refreshing video like status...");

      // Fetch current like status
      const likeStatus = await fetchVideoLike(videoId);
      console.log("Refreshed like status:", likeStatus);

      setLiked(likeStatus.liked);

      // Also refresh the video data to get updated like count
      const videoResponse = await getVideoById(token, videoId);
      const videoData = videoResponse?.data?.data || videoResponse?.data;

      if (videoData) {
        const updatedLikeCount = videoData.likesCount || videoData.likes || 0;
        console.log("Updated like count:", updatedLikeCount);
        setLikeCount(updatedLikeCount);

        // Update video object
        setVideo((prev) => ({
          ...prev,
          likesCount: updatedLikeCount,
        }));
      }
    } catch (err) {
      console.error("Error refreshing like status:", err);
    }
  };

  // NEW: Refresh comment likes
  const refreshCommentLikes = async () => {
    if (!token || !videoId || comments.length === 0) return;

    try {
      const updatedComments = await fetchCommentLikes(comments);
      setComments(updatedComments);
    } catch (err) {
      console.error("Error refreshing comment likes:", err);
    }
  };

  const fetchSubscriptionStatus = async (channelId) => {
    if (!token || !channelId || !currentUser?.data?._id) return;

    try {
      setSubscriptionError(null);
      const response = await getSubscribedChannels(token, currentUser.data._id);
      const subscribedChannels = response?.data?.data?.subscribedChannels || [];

      const isChannelSubscribed = subscribedChannels.some(
        (sub) =>
          sub.channelDetails?._id === channelId || sub.channel === channelId
      );

      setIsSubscribed(isChannelSubscribed);
    } catch (err) {
      console.error("Error fetching subscription status:", err);
      setIsSubscribed(false);
    }
  };

  // ENHANCED: Like handler with refresh functionality
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !video?._id || likesLoading) return;

    try {
      setLikesLoading(true);
      setLikeError(null);

      console.log("Toggling like for video:", video._id);
      console.log("Current like state:", liked);

      const response = await toggleVideoLike(token, video._id);
      console.log("Like toggle response:", response);

      // Handle the response - log the full structure to debug
      const responseData = response?.data?.data || response?.data;
      console.log("Response data:", responseData);

      if (responseData) {
        // Check different possible response structures
        const newLikedState =
          responseData.liked !== undefined
            ? responseData.liked
            : responseData.isLiked !== undefined
            ? responseData.isLiked
            : !liked; // fallback to toggle

        const newLikeCount =
          responseData.totalLikes !== undefined
            ? responseData.totalLikes
            : responseData.likesCount !== undefined
            ? responseData.likesCount
            : responseData.likes !== undefined
            ? responseData.likes
            : newLikedState
            ? likeCount + 1
            : Math.max(0, likeCount - 1);

        console.log("Setting new like state:", newLikedState);
        console.log("Setting new like count:", newLikeCount);

        setLiked(newLikedState);
        setLikeCount(newLikeCount);
        setDisliked(false); // Reset dislike when liking

        // Update video object
        setVideo((prev) => ({
          ...prev,
          likesCount: newLikeCount,
          isLikedByUser: newLikedState,
        }));
      } else {
        // If no clear response, refresh the status
        console.log("No clear response, refreshing status...");
        setTimeout(() => refreshVideoLikeStatus(), 500);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setLikeError(err.response?.data?.message || "Failed to update like");

      // Try to refresh status on error
      setTimeout(() => refreshVideoLikeStatus(), 1000);
    } finally {
      setLikesLoading(false);
    }
  };

  // FIXED: Handle dislike (assuming you'll add this to backend)
  const handleDislike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !video?._id || likesLoading) return;

    // For now, just toggle the dislike state locally since backend doesn't support it
    setDisliked(!disliked);
    if (liked) {
      // If was liked, unlike it first
      handleLike(e);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !video?.owner?._id || subscribing) return;

    try {
      setSubscribing(true);
      setSubscriptionError(null);

      const response = await toggleSubscription(token, video.owner._id);
      const responseData = response?.data?.data || response?.data;

      if (responseData) {
        setIsSubscribed(
          responseData.subscribed !== undefined
            ? responseData.subscribed
            : !isSubscribed
        );
      } else {
        setIsSubscribed(!isSubscribed);
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
      setSubscriptionError(
        err.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setSubscribing(false);
    }
  };

  // ENHANCED: Comment like handler with refresh functionality
  const handleToggleCommentLike = async (commentId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!token || !commentId) return;

    try {
      const response = await toggleCommentLike(token, commentId);
      console.log("Comment like response:", response);

      const likeData = response?.data?.data || response?.data;

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            // Use server response if available, otherwise toggle locally
            if (likeData && typeof likeData.liked === "boolean") {
              return {
                ...comment,
                isLiked: likeData.liked,
                likesCount:
                  likeData.totalLikes ||
                  (likeData.liked
                    ? (comment.likesCount || 0) + 1
                    : Math.max(0, (comment.likesCount || 0) - 1)),
              };
            } else {
              // Fallback to local toggle
              const wasLiked = comment.isLiked;
              return {
                ...comment,
                isLiked: !wasLiked,
                likesCount: wasLiked
                  ? Math.max(0, (comment.likesCount || 0) - 1)
                  : (comment.likesCount || 0) + 1,
              };
            }
          }
          return comment;
        })
      );

      // If server response wasn't clear, refresh comment likes
      if (!likeData || typeof likeData.liked !== "boolean") {
        setTimeout(refreshCommentLikes, 500);
      }
    } catch (err) {
      console.error("Error toggling comment like:", err);
      setCommentsError("Failed to update comment like");

      // Try to refresh comment likes on error
      setTimeout(refreshCommentLikes, 1000);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !videoId || !newComment.trim() || addingComment) return;

    try {
      setAddingComment(true);
      setCommentsError(null);

      const response = await addComment(token, videoId, {
        content: newComment.trim(),
      });

      let newCommentData = null;
      if (response?.data?.comment) {
        newCommentData = response.data.comment;
      } else if (response?.data?.data?.comment) {
        newCommentData = response.data.data.comment;
      } else if (response?.data?.data) {
        newCommentData = response.data.data;
      }

      if (newCommentData) {
        // Ensure new comment has proper like structure
        const processedComment = {
          ...newCommentData,
          likesCount: newCommentData.likesCount || 0,
          isLiked: newCommentData.isLiked || false,
        };

        setComments((prev) => [processedComment, ...prev]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentsError("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleEditComment = async (commentId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !editingCommentText.trim()) return;

    try {
      const response = await updateComment(token, commentId, {
        content: editingCommentText.trim(),
      });

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? { ...comment, content: editingCommentText.trim() }
            : comment
        )
      );

      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (err) {
      console.error("Error updating comment:", err);
      setCommentsError("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || deletingCommentId) return;

    try {
      setDeletingCommentId(commentId);
      await deleteComment(token, commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
      setCommentsError("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator.share({
        title: video.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Format functions
  const formatViews = (views) => {
    if (!views || views === 0) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "unknown";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch (error) {
      return "unknown";
    }
  };

  // Single useEffect for initial data loading
  useEffect(() => {
    fetchVideoData();
  }, [token, videoId]);

  // Fetch comments after video is loaded
  useEffect(() => {
    if (video && videoId && token) {
      fetchVideoComments();
    }
  }, [video, videoId, token]);

  // Reset state when videoId changes
  useEffect(() => {
    setLiked(false);
    setDisliked(false);
    setLikeCount(0);
    setLikeError(null);
    setComments([]);
    setCommentsError(null);
    setIsSubscribed(false);
    setSubscriptionError(null);
  }, [videoId]);

  // 6. Enhanced useEffect for initial data loading - replace the existing one
  useEffect(() => {
    if (token && videoId) {
      console.log("Initial data fetch triggered");
      fetchVideoData();
    }
  }, [token, videoId]);

  // 7. Add this useEffect to handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && video && token && videoId) {
        // Page became visible, refresh like status
        console.log("Page became visible, refreshing like status");
        refreshVideoLikeStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [video, token, videoId]);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-700 aspect-video rounded-lg mb-6"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Video Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
          <div className="text-yellow-500 text-6xl mb-4">📹</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Video Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Video data is not available
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Videos
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl mb-6">
              <video
                className="w-full aspect-video"
                controls
                poster={video.thumbnail?.url ?? undefined}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={video.videoFile?.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {video.title}
              </h1>

              {/* Video Stats */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{formatViews(video.views)} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    disabled={likesLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      liked
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    } ${likesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsUp size={16} />
                    <span>Like {likeCount > 0 && `(${likeCount})`}</span>
                  </button>

                  <button
                    onClick={handleDislike}
                    disabled={likesLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      disliked
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    } ${likesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsDown size={16} />
                    {dislikeCount > 0 && <span>({dislikeCount})</span>}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>

                  <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Like Error Display */}
              {likeError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {likeError}
                </div>
              )}

              {/* Creator Info */}
              <div className="flex items-center justify-between border-t dark:border-gray-700 pt-6">
                <div className="flex items-center gap-4">
                  {video.owner?.avatar ? (
                    <img
                      src={video.owner.avatar}
                      alt={video.owner?.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {video.owner?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {video.owner?.fullName || "Unknown Creator"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Content Creator
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    isSubscribed
                      ? "bg-gray-500 hover:bg-gray-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  } ${subscribing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {subscribing ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>{isSubscribed ? "Subscribed" : "Subscribe"}</>
                  )}
                </button>
              </div>

              {/* Subscription Error Display */}
              {subscriptionError && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {subscriptionError}
                </div>
              )}

              {/* Description */}
              <div className="mt-6">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {showDescription ? "Hide Description" : "Show Description"}
                </button>
                {showDescription && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {video.description || "No description available."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle size={20} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Comments ({comments.length})
                </h2>
              </div>

              {/* Add Comment */}
              {currentUser && (
                <div className="mb-8">
                  <div className="flex gap-4">
                    {currentUser.data?.avatar ? (
                      <img
                        src={currentUser.data.avatar}
                        alt={currentUser.data?.fullName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {currentUser.data?.fullName?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </div>
                    )}
                    <div className="flex-1">
                      <form onSubmit={handleAddComment}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="3"
                        />
                        <div className="flex justify-end mt-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setNewComment("")}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!newComment.trim() || addingComment}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                          >
                            {addingComment ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                Comment
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Error Display */}
              {commentsError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {commentsError}
                </div>
              )}

              {/* Comments Loading */}
              {commentsLoading && (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Loading comments...
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-4">
                    {comment.owner?.avatar ? (
                      <img
                        src={comment.owner.avatar}
                        alt={comment.owner?.fullName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.owner?.fullName?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.owner?.fullName || "Anonymous"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>

                      {editingCommentId === comment._id ? (
                        <div className="mt-2">
                          <textarea
                            value={editingCommentText}
                            onChange={(e) =>
                              setEditingCommentText(e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows="3"
                          />
                          <div className="flex justify-end mt-2 gap-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentText("");
                              }}
                              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => handleEditComment(comment._id, e)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {comment.content}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) =>
                            handleToggleCommentLike(comment._id, e)
                          }
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            comment.isLiked
                              ? "text-blue-500"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          <ThumbsUp size={14} />
                          <span>{comment.likesCount || 0}</span>
                        </button>

                        {currentUser?.data?._id === comment.owner?._id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingCommentId(comment._id);
                                setEditingCommentText(comment.content);
                              }}
                              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={(e) =>
                                handleDeleteComment(comment._id, e)
                              }
                              disabled={deletingCommentId === comment._id}
                              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                            >
                              {deletingCommentId === comment._id ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Comments Message */}
              {!commentsLoading && comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <p className="text-gray-600 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Video Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Views:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatViews(video.views)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Duration:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatDuration(video.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Published:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatDate(video.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Likes:
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {likeCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailpage;
