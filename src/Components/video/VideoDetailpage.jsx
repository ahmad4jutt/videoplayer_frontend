import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  getUserChannelSubscriber,
  isUserSubscribed,
  getTotalSubscribers,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
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
  const { videoId, channelId } = useParams();
  const { currentUser, token } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Add ref to track if video data has been fetched
  const hasInitialized = useRef(false);
  const viewCountedRef = useRef(false);

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
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriberLoading, setSubscriberLoading] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  // Handle image error for avatars
  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src);
  };

  // FIXED: Fetch video like status function
  const fetchVideoLikeStatus = useCallback(async () => {
    if (!token || !videoId) return { liked: false, likeCount: 0 };

    try {
      console.log("Fetching like status for video:", videoId);
      const response = await getVideoWithLikeStatus(token, videoId);
      console.log("Like status response:", response);

      const videoData = response.data?.data || response.data;

      if (!videoData) {
        console.warn("No video data found in like status response");
        return { liked: false, likeCount: 0 };
      }

      const isLiked = videoData.isLikedByUser || false;
      const likeCount = videoData.likesCount || videoData.likes || 0;

      console.log(`Video ${videoId} is liked:`, isLiked);
      console.log(`Video ${videoId} like count:`, likeCount);

      return { liked: isLiked, likeCount: likeCount };
    } catch (error) {
      console.error("Error fetching video like status:", error);
      return { liked: false, likeCount: 0 };
    }
  }, [token, videoId]);

  // FIXED: Fetch comment likes function
  const fetchCommentLikes = useCallback(
    async (comments) => {
      if (!token || !comments || comments.length === 0) return comments;

      try {
        const processedComments = comments.map((comment) => ({
          ...comment,
          likesCount: comment.likesCount || 0,
          isLiked: comment.isLiked || false,
        }));

        return processedComments;
      } catch (err) {
        console.error("Error processing comment likes:", err);
        return comments.map((comment) => ({
          ...comment,
          likesCount: comment.likesCount || 0,
          isLiked: false,
        }));
      }
    },
    [token]
  );

  // FIXED: Fetch subscriber count with better error handling
  const fetchSubscriberCount = useCallback(
    async (channelId) => {
      if (!token || !channelId) return;

      try {
        setSubscriberLoading(true);
        console.log("Fetching subscriber count for channel:", channelId);

        // Use the new getTotalSubscribers API
        const response = await getTotalSubscribers(token, channelId);
        console.log("Subscriber count response:", response);

        // Get the count from the response (based on your controller structure)
        const count = response?.data?.data?.totalSubscribers || 0;

        console.log("Setting subscriber count to:", count);
        setSubscriberCount(count);
      } catch (err) {
        console.error("Error fetching subscriber count:", err);
        setSubscriberCount(0);
      } finally {
        setSubscriberLoading(false);
      }
    },
    [token]
  );
  const fetchSubscriptionStatus = useCallback(
    async (channelId) => {
      if (!token || !channelId || !currentUser?.data?._id) {
        setIsLoadingSubscription(false);
        return;
      }
      try {
        setSubscriptionError(null);
        setIsLoadingSubscription(true);
        console.log("Fetching subscription status for channel:", channelId);

        const response = await isUserSubscribed(token, channelId);
        console.log("Subscription status response:", response);

        const subscriptionData = response?.data?.data;
        const isChannelSubscribed = subscriptionData?.isSubscribed || false;
        const isOwnChannel = subscriptionData?.isOwnChannel || false;

        console.log("Is subscribed:", isChannelSubscribed);
        console.log("Is own channel:", isOwnChannel);

        setIsSubscribed(isChannelSubscribed);
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        setIsSubscribed(false);
        setSubscriptionError(
          err.message || "Failed to fetch subscription status"
        );
      } finally {
        setIsLoadingSubscription(false);
      }
    },
    [token, currentUser?.data?._id]
  );

  useEffect(() => {
    if (channelId) {
      fetchSubscriptionStatus(channelId);
    }
  }, [channelId, fetchSubscriptionStatus]);
  // FIXED: Handle subscription with immediate UI update and proper refresh
  const handleSubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !video?.owner?._id || subscribing) return;

    const previousSubscribedState = isSubscribed;
    const previousSubscriberCount = subscriberCount;

    try {
      setSubscribing(true);
      setSubscriptionError(null);

      console.log("Toggling subscription for channel:", video.owner._id);
      console.log("Current subscription state:", isSubscribed);

      // Optimistically update UI
      const newSubscribedState = !previousSubscribedState;
      setIsSubscribed(newSubscribedState);
      setSubscriberCount((prev) =>
        newSubscribedState ? prev + 1 : Math.max(0, prev - 1)
      );

      // Call the toggle subscription API
      const response = await toggleSubscription(token, video.owner._id);
      console.log("Toggle subscription response:", response);

      const responseData = response?.data?.data || response?.data;

      // Update with server response if available
      if (responseData && typeof responseData.subscribed === "boolean") {
        setIsSubscribed(responseData.subscribed);

        // Update subscriber count based on server response
        if (responseData.subscribed && !previousSubscribedState) {
          // User just subscribed
          setSubscriberCount(previousSubscriberCount + 1);
        } else if (!responseData.subscribed && previousSubscribedState) {
          // User just unsubscribed
          setSubscriberCount(Math.max(0, previousSubscriberCount - 1));
        }
      }

      // Refresh data from server after a short delay to ensure consistency
      setTimeout(async () => {
        try {
          await Promise.all([
            fetchSubscriptionStatus(video.owner._id),
            fetchSubscriberCount(video.owner._id),
          ]);
          console.log("Refreshed subscription status and count after toggle");
        } catch (refreshError) {
          console.error(
            "Error refreshing data after subscription toggle:",
            refreshError
          );
        }
      }, 500);
    } catch (err) {
      console.error("Error toggling subscription:", err);

      // Revert state on error
      setIsSubscribed(previousSubscribedState);
      setSubscriberCount(previousSubscriberCount);

      setSubscriptionError(
        err.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setSubscribing(false);
    }
  };

  const formatSubscriberCount = (count) => {
    if (!count || count === 0) return "0 subscribers";
    if (count === 1) return "1 subscriber";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
    return `${count} subscribers`;
  };
  // FIXED: Fetch video data - only called once on mount
  const fetchVideoData = useCallback(async () => {
    if (!token || !videoId || hasInitialized.current) return;

    try {
      setLoading(true);
      setError(null);
      hasInitialized.current = true;

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

      // FIXED: Fetch like status and set properly
      const likeStatus = await fetchVideoLikeStatus();
      setLiked(likeStatus.liked);
      setLikeCount(likeStatus.likeCount);

      // Fetch subscription status and subscriber count
      if (currentUser?.data?._id && videoData.owner?._id) {
        await fetchSubscriptionStatus(videoData.owner._id);
        await fetchSubscriberCount(videoData.owner._id);
      }
    } catch (err) {
      console.error("Error fetching video:", err);
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [token, videoId, currentUser, fetchVideoLikeStatus, fetchSubscriberCount]);

  // FIXED: Fetch comments with proper like status
  const fetchVideoComments = useCallback(async () => {
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

      const commentsWithLikes = await fetchCommentLikes(commentsData);
      setComments(commentsWithLikes);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setCommentsError("Failed to load comments");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [token, videoId, commentsLoading, fetchCommentLikes]);

  // FIXED: Subscription status fetch

  // FIXED: Like handler with proper state management
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

      const responseData = response?.data?.data || response?.data;

      if (responseData) {
        const newLikedState =
          responseData.liked !== undefined ? responseData.liked : !liked;

        const newLikeCount =
          responseData.totalLikes !== undefined
            ? responseData.totalLikes
            : responseData.likesCount !== undefined
            ? responseData.likesCount
            : newLikedState
            ? likeCount + 1
            : Math.max(0, likeCount - 1);

        setLiked(newLikedState);
        setLikeCount(newLikeCount);
        setDisliked(false);

        // Update video object
        setVideo((prev) => ({
          ...prev,
          likesCount: newLikeCount,
          isLikedByUser: newLikedState,
        }));
      } else {
        // Fallback: refresh like status
        const refreshedStatus = await fetchVideoLikeStatus();
        setLiked(refreshedStatus.liked);
        setLikeCount(refreshedStatus.likeCount);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setLikeError(err.response?.data?.message || "Failed to update like");
    } finally {
      setLikesLoading(false);
    }
  };

  // Handle dislike
  const handleDislike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !video?._id || likesLoading) return;

    setDisliked(!disliked);
    if (liked) {
      handleLike(e);
    }
  };

  // FIXED: Comment like handler
  const handleToggleCommentLike = async (commentId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!token || !commentId) return;

    try {
      const response = await toggleCommentLike(token, commentId);
      const likeData = response?.data?.data || response?.data;

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
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
    } catch (err) {
      console.error("Error toggling comment like:", err);
      setCommentsError("Failed to update comment like");
    }
  };

  // Add comment handler
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

  // Edit comment handler
  const handleEditComment = async (commentId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !editingCommentText.trim()) return;

    try {
      await updateComment(token, commentId, {
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

  // Delete comment handler
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

  // Share handler
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

  // FIXED: Single useEffect for initial data loading
  useEffect(() => {
    if (token && videoId && !hasInitialized.current) {
      console.log("Initial data fetch triggered");
      fetchVideoData();
    }
  }, [token, videoId, fetchVideoData]);

  // Fetch comments after video is loaded
  useEffect(() => {
    if (video && videoId && token && !commentsLoading) {
      fetchVideoComments();
    }
  }, [video, videoId, token]);

  // FIXED: Reset state when videoId changes
  useEffect(() => {
    if (!videoId || !video?.owner?._id) return;

    // Initialize data when video changes
    const initializeVideoData = async () => {
      try {
        console.log("Initializing video data for:", videoId);

        // Reset states first
        setIsSubscribed(false);
        setSubscriberCount(0);
        setSubscriptionError(null);
        setSubscriberLoading(true);

        // Fetch both subscription status and subscriber count
        await Promise.all([
          fetchSubscriptionStatus(video.owner._id),
          fetchSubscriberCount(video.owner._id),
        ]);

        console.log("Video data initialization complete");
      } catch (error) {
        console.error("Error initializing video data:", error);
      }
    };

    initializeVideoData();

    // Cleanup function
    return () => {
      hasInitialized.current = false;
      viewCountedRef.current = false;
      setLiked(false);
      setDisliked(false);
      setLikeCount(0);
      setLikeError(null);
      setComments([]);
      setCommentsError(null);
      setIsSubscribed(false);
      setSubscriptionError(null);
      setSubscriberCount(0);
      setSubscriberLoading(false);
    };
  }, [
    videoId,
    video?.owner?._id,
    fetchSubscriptionStatus,
    fetchSubscriberCount,
  ]);

  if (loading) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div
              className={`${
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              } aspect-video rounded-lg mb-6`}
            ></div>
            <div
              className={`h-6 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              } rounded mb-4`}
            ></div>
            <div
              className={`h-4 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-300"
              } rounded w-3/4 mb-4`}
            ></div>
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-12 h-12 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-300"
                } rounded-full`}
              ></div>
              <div className="flex-1">
                <div
                  className={`h-4 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } rounded mb-2`}
                ></div>
                <div
                  className={`h-3 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } rounded w-1/2`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
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
            Video Not Found
          </h2>
          <p
            className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
          >
            {error}
          </p>
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
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div
          className={`text-center p-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl shadow-lg max-w-md mx-4`}
        >
          <div className="text-yellow-500 text-6xl mb-4">📹</div>
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-2`}
          >
            No Video Data
          </h2>
          <p
            className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
          >
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
  const LoadingSpinner = () => (
    <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
  );
  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 ${
            isDarkMode
              ? "text-gray-400 hover:text-white"
              : "text-gray-600 hover:text-gray-800"
          } mb-6 transition-colors`}
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
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6 mb-6`}
            >
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                {video.title}
              </h1>

              {/* Video Stats */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`flex items-center gap-6 text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
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
                        : `${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`
                    } ${likesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsUp size={16} />
                    <span> {likeCount > 0 && `${likeCount}`}</span>
                  </button>

                  <button
                    onClick={handleDislike}
                    disabled={likesLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      disliked
                        ? "bg-red-500 text-white"
                        : `${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`
                    } ${likesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsDown size={16} />
                    {dislikeCount > 0 && <span>({dislikeCount})</span>}
                  </button>

                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>

                  <button
                    className={`p-2 rounded-full ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Like Error Display */}
              {likeError && (
                <div
                  className={`mb-4 p-3 ${
                    isDarkMode
                      ? "bg-red-900 text-red-300"
                      : "bg-red-100 text-red-700"
                  } rounded-lg text-sm`}
                >
                  {likeError}
                </div>
              )}

              {/* Creator Info */}
              <div
                className={`flex items-center justify-between border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } pt-6`}
              >
                <Link to={`/channel/${video.owner?._id}`}>
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
                      <h3
                        className={`font-semibold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {video.owner?.fullName || "Unknown Creator"}
                      </h3>
                      {subscriberLoading ? (
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          } flex items-center gap-1`}
                        >
                          <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                          Loading...
                        </span>
                      ) : (
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatSubscriberCount(subscriberCount)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing || isLoadingSubscription}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    isLoadingSubscription
                      ? "bg-gray-400 text-white" // Show neutral color while loading
                      : isSubscribed
                      ? "bg-gray-500 hover:bg-gray-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  } ${
                    subscribing || isLoadingSubscription
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {subscribing ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading...
                    </>
                  ) : isLoadingSubscription ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Checking...
                    </>
                  ) : (
                    <>{isSubscribed ? "Subscribed" : "Subscribe"}</>
                  )}
                </button>
              </div>

              {/* Subscription Error Display */}
              {subscriptionError && (
                <div
                  className={`mt-4 p-3 ${
                    isDarkMode
                      ? "bg-red-900 text-red-300"
                      : "bg-red-100 text-red-700"
                  } rounded-lg text-sm`}
                >
                  {subscriptionError}
                </div>
              )}

              {/* Description */}
              <div className="mt-6">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className={`flex items-center gap-2 ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-500 hover:text-blue-600"
                  } font-medium`}
                >
                  {showDescription ? "Hide Description" : "Show Description"}
                </button>
                {showDescription && (
                  <div
                    className={`mt-4 p-4 ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    } rounded-lg`}
                  >
                    <p
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      } whitespace-pre-wrap`}
                    >
                      {video.description || "No description available."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6`}
            >
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-6 flex items-center gap-2`}
              >
                <MessageCircle size={20} />
                Comments ({comments.length})
              </h3>

              {/* Add Comment Form */}
              {currentUser && (
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="flex gap-3">
                    {currentUser.data?.avatar ||
                    currentUser.data?.data.avatar ? (
                      <img
                        src={
                          currentUser.data.avatar ||
                          currentUser.data?.data.avatar
                        }
                        alt={currentUser.data?.fullName || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={handleImageError}
                        onLoad={() => console.log("Image loaded successfully")}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {currentUser?.data?.fullName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className={`w-full p-3 border ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                        rows="3"
                        disabled={addingComment}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setNewComment("")}
                          className={`px-4 py-2 ${
                            isDarkMode
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-gray-800"
                          } transition-colors`}
                          disabled={addingComment}
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
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              Comment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments Error Display */}
              {commentsError && (
                <div
                  className={`mb-4 p-3 ${
                    isDarkMode
                      ? "bg-red-900 text-red-300"
                      : "bg-red-100 text-red-700"
                  } rounded-lg text-sm`}
                >
                  {commentsError}
                </div>
              )}

              {/* Comments Loading */}
              {commentsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span
                    className={`ml-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Loading comments...
                  </span>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 && !commentsLoading ? (
                  <div
                    className={`text-center py-8 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <MessageCircle
                      size={48}
                      className="mx-auto mb-4 opacity-50"
                    />
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className={`flex gap-3 p-4 ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      } rounded-lg`}
                    >
                      {comment.owner?.avatar ? (
                        <img
                          src={comment.owner.avatar}
                          alt={comment.owner?.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                          {comment.owner?.fullName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {comment.owner?.fullName || "Anonymous"}
                          </h4>
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>

                        {editingCommentId === comment._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                              className={`w-full p-2 border ${
                                isDarkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-300 bg-white text-gray-900"
                              } rounded`}
                              rows="2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) =>
                                  handleEditComment(comment._id, e)
                                }
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentText("");
                                }}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className={`${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            } mb-3`}
                          >
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
                                : `${
                                    isDarkMode
                                      ? "text-gray-400 hover:text-blue-500"
                                      : "text-gray-500 hover:text-blue-500"
                                  }`
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
                                className={`flex items-center gap-1 text-sm ${
                                  isDarkMode
                                    ? "text-gray-400 hover:text-blue-500"
                                    : "text-gray-500 hover:text-blue-500"
                                } transition-colors`}
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                onClick={(e) =>
                                  handleDeleteComment(comment._id, e)
                                }
                                disabled={deletingCommentId === comment._id}
                                className={`flex items-center gap-1 text-sm ${
                                  isDarkMode
                                    ? "text-gray-400 hover:text-red-500"
                                    : "text-gray-500 hover:text-red-500"
                                } transition-colors disabled:opacity-50`}
                              >
                                {deletingCommentId === comment._id ? (
                                  <>
                                    <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={14} />
                                    Delete
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6`}
            >
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                Video Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Duration
                  </label>
                  <p
                    className={`${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {formatDuration(video.duration)}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Views
                  </label>
                  <p
                    className={`${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {formatViews(video.views)}
                  </p>
                </div>

                <div>
                  <label
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Published
                  </label>
                  <p
                    className={`${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {formatDate(video.createdAt)}
                  </p>
                </div>

                {video.owner && (
                  <div>
                    <label
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Creator
                    </label>
                    <p
                      className={`${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {video.owner.fullName}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Share2 size={16} />
                  Share Video
                </button>

                <button
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } rounded-lg transition-colors`}
                >
                  <Download size={16} />
                  Download
                </button>

                <button
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${
                    isDarkMode
                      ? "bg-red-900 text-red-300 hover:bg-red-800"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  } rounded-lg transition-colors`}
                >
                  <Flag size={16} />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailpage;
