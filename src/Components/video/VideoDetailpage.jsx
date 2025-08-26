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
  isUserSubscribed,
  getTotalSubscribers,
  addVideoToPlaylist,
  createPlaylist,
  getUserPlaylists,
} from "../../services/api";
import CommentsModal from "./Commentsmodal";
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
  AlertTriangle,
  PlayCircle,
  Settings,
  Bell,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Plus,
  List,
  Check,
  Monitor,
} from "lucide-react";
import { toast } from "react-toastify";

const VideoDetailpage = () => {
  const { videoId, channelId, userId } = useParams();
  const { currentUser, token } = useAuth();

  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Add ref to track if video data has been fetched
  const hasInitialized = useRef(false);
  const viewCountedRef = useRef(false);
  const videoRef = useRef(null);

  // Video states
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [displayedVideosCount, setDisplayedVideosCount] = useState(5);
  const [showingAllRelated, setShowingAllRelated] = useState(false);

  // Likes states
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

  // NEW: Comments modal state for mobile
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // Updated Subscription states to match UserChannelPage
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriberLoading, setSubscriberLoading] = useState(false);
  // Unsubscribe modal states
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  // Share modal states
  const [showShareModal, setShowShareModal] = useState(false);

  // Playlist states
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [showCreatePlaylistForm, setShowCreatePlaylistForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  // More options menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const fetchVideoLikeStatus = useCallback(async () => {
    if (!token || !videoId) return { liked: false, likeCount: 0 };

    try {
      const response = await getVideoWithLikeStatus(token, videoId);

      const videoData = response.data?.data || response.data;

      if (!videoData) {
        return { liked: false, likeCount: 0 };
      }

      const isLiked = videoData.isLikedByUser || false;
      const likeCount = videoData.likesCount || videoData.likes || 0;

      return { liked: isLiked, likeCount: likeCount };
    } catch (error) {
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

        const response = await getTotalSubscribers(token, channelId);

        const count = response?.data?.data?.totalSubscribers || 0;

        setSubscriberCount(count);
      } catch (err) {
        setSubscriberCount(0);
      } finally {
        setSubscriberLoading(false);
      }
    },
    [token]
  );

  // Updated: Fetch subscription status to match UserChannelPage
  const checkSubscriptionStatus = async (channelId) => {
    if (!token || !channelId) return;

    try {
      setSubscriptionLoading(true);

      const response = await isUserSubscribed(token, channelId);

      setSubscriptionData(response.data.data);
    } catch (err) {
      setSubscriptionData(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Updated: Handle subscription with confirmation modal for unsubscribe
  const handleSubscription = async () => {
    if (subscriptionData?.isOwnChannel || !video?.owner?._id) return;

    // Show confirmation modal for unsubscribe
    if (subscriptionData?.isSubscribed) {
      setShowUnsubscribeModal(true);
      return;
    }

    await performSubscriptionToggle();
  };

  // Separate function to perform the actual subscription toggle
  const performSubscriptionToggle = async () => {
    try {
      setIsSubscribing(true);

      const response = await toggleSubscription(token, video.owner._id);

      // Update subscription status locally
      setSubscriptionData((prev) => ({
        ...prev,
        isSubscribed: response.data.data.subscribed,
      }));

      // Refresh subscriber count
      await fetchSubscriberCount(video.owner._id);
      setShowUnsubscribeModal(false);
    } catch (err) {
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatSubscriberCount = (count) => {
    if (!count || count === 0) return "0 subscribers";
    if (count === 1) return "1 subscriber";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
    return `${count} subscribers`;
  };

  const fetchVideoData = useCallback(async () => {
    if (!token || !videoId || hasInitialized.current) return;

    try {
      setLoading(true);
      setError(null);
      hasInitialized.current = true;

      const videoResponse = await getVideoById(token, videoId);

      let videoData = null;
      let relatedVideosData = [];

      // Handle the response structure with related videos
      if (videoResponse?.data?.data) {
        const responseData = videoResponse.data.data;
        if (responseData.video) {
          // New structure with video and relatedVideos
          videoData = responseData.video;
          relatedVideosData = responseData.relatedVideos || [];
        } else {
          // Old structure - just video data
          videoData = responseData;
        }
      } else if (videoResponse?.data) {
        videoData = videoResponse.data;
      }

      if (!videoData) {
        setError("Video not found");
        return;
      }

      setVideo(videoData);
      setRelatedVideos(relatedVideosData);

      // Rest of your existing code for likes, subscription, etc.
      const likeStatus = await fetchVideoLikeStatus();
      setLiked(likeStatus.liked);
      setLikeCount(likeStatus.likeCount);

      // Updated subscription and subscriber count fetching
      if (videoData.owner?._id) {
        await checkSubscriptionStatus(videoData.owner._id);
        await fetchSubscriberCount(videoData.owner._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [token, videoId, fetchVideoLikeStatus, fetchSubscriberCount]);

  // FIXED: Fetch comments with proper like status
  const fetchVideoComments = useCallback(async () => {
    if (!token || !videoId || commentsLoading) return;

    try {
      setCommentsLoading(true);
      setCommentsError(null);

      const response = await getComments(token, videoId);

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
      setCommentsError("Failed to load comments");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [token, videoId, commentsLoading, fetchCommentLikes]);

  // FIXED: Like handler with proper state management
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token || !video?._id || likesLoading) return;

    try {
      setLikesLoading(true);
      setLikeError(null);

      const response = await toggleVideoLike(token, video._id);

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

        setVideo((prev) => ({
          ...prev,
          likesCount: newLikeCount,
          isLikedByUser: newLikedState,
        }));
      } else {
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

  // FIXED: Add comment handler with proper user data handling
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
        // FIXED: Add current user data to the comment if not present
        const processedComment = {
          ...newCommentData,
          likesCount: newCommentData.likesCount || 0,
          isLiked: newCommentData.isLiked || false,
          owner: newCommentData.owner || {
            _id: currentUser?.data?._id || currentUser?.data?.data?._id,
            fullName:
              currentUser?.data?.fullName ||
              currentUser?.data?.data?.fullName ||
              "You",
            username:
              currentUser?.data?.username || currentUser?.data?.data?.username,
            avatar:
              currentUser?.data?.avatar || currentUser?.data?.data?.avatar,
          },
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

  // FIXED: Edit comment handler
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
      toast.success("Link copied to clipboard!");
    }
  };
  const fetchUserPlaylists = async () => {
    if (!token || !currentUser) {
      return;
    }

    // Make sure currentUser has an id property
    if (!currentUser.id && !currentUser._id && !currentUser.userId) {
      return;
    }

    try {
      setPlaylistsLoading(true);

      // Extract user ID from currentUser object
      // Adjust the property name based on your user object structure
      const userId = currentUser.id || currentUser._id || currentUser.userId;

      const response = await getUserPlaylists(token, userId);

      // Handle the actual response structure based on your API
      let playlists = [];
      // Your API returns data directly in response.data (which is an array)
      if (response?.data && Array.isArray(response.data)) {
        playlists = response.data;
      }
      // Fallback checks for other possible structures
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        playlists = response.data.data;
      } else if (response?.playlists && Array.isArray(response.playlists)) {
        playlists = response.playlists;
      }
      // If response itself is an array (direct axios response)
      else if (Array.isArray(response)) {
        playlists = response;
      }

      // Process playlists to ensure they have the right structure
      const processedPlaylists = playlists.map((playlist) => ({
        ...playlist,
        videoCount: playlist.videos ? playlist.videos.length : 0,
      }));

      setUserPlaylists(processedPlaylists);
    } catch (err) {
      // Show more detailed error information
      const errorMessage =
        err.response?.data?.message || err.message || "Unknown error";
      setUserPlaylists([]);
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!token || !videoId || !playlistId) return;

    try {
      setAddingToPlaylist(true);
      await addVideoToPlaylist(token, videoId, playlistId);

      // Show success message
      const playlist = userPlaylists.find((p) => p._id === playlistId);
      toast.success(`Video added to "${playlist?.name}" successfully!`);

      setShowPlaylistModal(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add video to playlist";
      if (errorMessage.includes("already in the playlist")) {
        toast.error("Video is already in this playlist!");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setAddingToPlaylist(false);
    }
  };
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!token || !newPlaylistName.trim()) return;

    try {
      setCreatingPlaylist(true);

      const response = await createPlaylist(token, {
        name: newPlaylistName.trim(),
        description: newPlaylistDescription.trim(),
      });

      const newPlaylist = response?.data?.data || response?.data;

      // Add the video to the newly created playlist
      if (newPlaylist?._id) {
        await addVideoToPlaylist(token, videoId, newPlaylist._id);
        toast.success(
          `Playlist "${newPlaylistName}" created and video added successfully!`
        );
      }

      // Reset form and close modal
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setShowCreatePlaylistForm(false);
      setShowPlaylistModal(false);
    } catch (err) {
      console.error("Error creating playlist:", err);
      toast.error(err.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const openPlaylistModal = async () => {
    setShowPlaylistModal(true);

    // Only fetch if we don't have playlists or if there was a previous error
    if (userPlaylists.length === 0 && !playlistsLoading) {
      await fetchUserPlaylists();
    }
  };

  const handleRelatedVideoClick = (relatedVideoId) => {
    // Reset state for new video
    hasInitialized.current = false;
    viewCountedRef.current = false;
    setVideo(null);
    setRelatedVideos([]);
    setComments([]);
    setLiked(false);
    setDisliked(false);
    setLikeCount(0);
    setSubscriptionData(null);
    setSubscriberCount(0);

    // Navigate to new video
    navigate(`/video/${relatedVideoId}`);
  };
  const handleShowMoreRelated = () => {
    if (showingAllRelated) {
      // Reset to initial count
      setDisplayedVideosCount(5);
      setShowingAllRelated(false);
    } else {
      // Show all videos
      setDisplayedVideosCount(relatedVideos.length);
      setShowingAllRelated(true);
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
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close menus when clicking outside
      const isInsideMenu =
        event.target.closest(".resolution-menu") ||
        event.target.closest(".more-menu") ||
        event.target.closest(".playlist-modal") ||
        event.target.closest("[data-menu]");

      if (!isInsideMenu) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu || showShareModal || showPlaylistModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMoreMenu, showShareModal, showPlaylistModal]);

  // Initial data loading
  useEffect(() => {
    if (token && videoId && !hasInitialized.current) {
      fetchVideoData();
    }
  }, [token, videoId, fetchVideoData]);

  // Fetch comments after video is loaded
  useEffect(() => {
    if (video && videoId && token && !commentsLoading) {
      fetchVideoComments();
    }
  }, [video, videoId, token]);

  // Updated: Reset state when videoId changes
  useEffect(() => {
    if (!videoId || !video?.owner?._id) return;

    const initializeVideoData = async () => {
      try {
        setSubscriptionData(null);
        setSubscriberCount(0);
        setSubscriberLoading(true);
        setDisplayedVideosCount(5);
        setShowingAllRelated(false);
        await Promise.all([
          checkSubscriptionStatus(video.owner._id),
          fetchSubscriberCount(video.owner._id),
        ]);
      } catch (error) {
        console.error("Error initializing video data:", error);
      }
    };

    initializeVideoData();

    return () => {
      hasInitialized.current = false;
      viewCountedRef.current = false;
      setLiked(false);
      setDisliked(false);
      setLikeCount(0);
      setLikeError(null);
      setComments([]);
      setCommentsError(null);
      setSubscriptionData(null);
      setSubscriberCount(0);
      setSubscriberLoading(false);
      setDisplayedVideosCount(5);
      setShowingAllRelated(false);
    };
  }, [videoId, video?.owner?._id, fetchSubscriberCount]);

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

  // Unsubscribe Confirmation Modal
  const UnsubscribeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md mx-4 shadow-xl w-full`}
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle
            className="text-yellow-500 flex-shrink-0 mt-0.5"
            size={20}
          />
          <h3
            className={`text-base sm:text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Unsubscribe from {video?.owner?.fullName}?
          </h3>
        </div>
        <p
          className={`${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          } mb-6 text-sm sm:text-base`}
        >
          You won't receive notifications for new videos from this channel.
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => setShowUnsubscribeModal(false)}
            className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
              isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={performSubscriptionToggle}
            disabled={isSubscribing}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {isSubscribing ? (
              <>
                <LoadingSpinner />
                Unsubscribing...
              </>
            ) : (
              "Unsubscribe"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const PlaylistModal = () => {
    const [error, setError] = useState(null);

    const handleFetchPlaylists = async () => {
      try {
        setError(null);
        await fetchUserPlaylists();
      } catch (err) {
        setError("Failed to load playlists. Please try again.");
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div
          className={`${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }rounded-xl border shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-hidden`}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${
              isDarkMode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Add to Playlist
              </h2>
              <button
                onClick={() => {
                  setShowPlaylistModal(false);
                  setShowCreatePlaylistForm(false);
                  setNewPlaylistName("");
                  setNewPlaylistDescription("");
                  setError(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 flex-1 overflow-hidden">
            {/* Error Display */}
            {error && (
              <div
                className={`mb-4 p-4 rounded-lg border ${
                  isDarkMode
                    ? "bg-red-900/20 border-red-800 text-red-300"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-red-500 mt-0.5 flex-shrink-0"
                    size={16}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">{error}</p>
                    <button
                      onClick={handleFetchPlaylists}
                      className="text-sm font-medium underline hover:no-underline transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create New Playlist Form */}
            {showCreatePlaylistForm ? (
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter playlist name"
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border transition-colors resize-none ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    rows="3"
                    placeholder="Add a description for your playlist"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!newPlaylistName.trim() || creatingPlaylist}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creatingPlaylist ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create & Add
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePlaylistForm(false)}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Create New Playlist Button */}
                <button
                  onClick={() => setShowCreatePlaylistForm(true)}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                    isDarkMode
                      ? "border-blue-600 text-blue-400 hover:bg-blue-600/5"
                      : "border-blue-300 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Plus size={20} />
                  <span className="font-medium">Create New Playlist</span>
                </button>

                {/* Existing Playlists */}
                <div>
                  <h3
                    className={`text-sm font-medium mb-3 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Your Playlists
                  </h3>

                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {playlistsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Loading playlists...
                          </span>
                        </div>
                      </div>
                    ) : userPlaylists.length === 0 ? (
                      <div
                        className={`text-center py-12 ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        <List size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium mb-1">
                          No playlists yet
                        </p>
                        <p className="text-xs">
                          Create your first playlist to get started
                        </p>
                        {error && (
                          <button
                            onClick={handleFetchPlaylists}
                            className="mt-3 text-blue-500 hover:text-blue-600 text-sm font-medium underline hover:no-underline"
                          >
                            Retry Loading
                          </button>
                        )}
                      </div>
                    ) : (
                      userPlaylists.map((playlist) => (
                        <button
                          key={playlist._id}
                          onClick={() => handleAddToPlaylist(playlist._id)}
                          disabled={addingToPlaylist}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group ${
                            isDarkMode
                              ? "hover:bg-gray-800 disabled:hover:bg-transparent"
                              : "hover:bg-gray-50 disabled:hover:bg-transparent"
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <List size={18} className="text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium text-sm mb-1 ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {playlist.name}
                            </div>
                            {playlist.description && (
                              <div
                                className={`text-xs mb-1 line-clamp-1 ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {playlist.description}
                              </div>
                            )}
                            <div
                              className={`text-xs ${
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
                              {playlist.videoCount ||
                                playlist.videos?.length ||
                                0}{" "}
                              videos
                            </div>
                          </div>

                          {addingToPlaylist && (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && <UnsubscribeModal />}
      {showPlaylistModal && <PlaylistModal />}
      {/* NEW: Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          showCommentsModal={showCommentsModal}
          setShowCommentsModal={setShowCommentsModal}
          isDarkMode={isDarkMode}
          comments={comments}
          commentsLoading={commentsLoading}
          commentsError={commentsError}
          currentUser={currentUser}
          newComment={newComment}
          setNewComment={setNewComment}
          addingComment={addingComment}
          handleAddComment={handleAddComment}
          editingCommentId={editingCommentId}
          setEditingCommentId={setEditingCommentId}
          editingCommentText={editingCommentText}
          setEditingCommentText={setEditingCommentText}
          handleEditComment={handleEditComment}
          handleDeleteComment={handleDeleteComment}
          deletingCommentId={deletingCommentId}
          handleToggleCommentLike={handleToggleCommentLike}
          formatDate={formatDate}
        />
      )}

      {/* Add CSS for slide-up animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3  ">
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
                className={`text-2xl sm:text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                {video.title}
              </h1>

              {/* Video Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div
                  className={`flex flex-wrap items-center gap-4 text-sm ${
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
                    <span>{formatDuration(video.duration)} </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleLike}
                    disabled={likesLoading}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full text-sm transition-colors ${
                      liked
                        ? "bg-blue-500 text-white"
                        : `${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`
                    } ${likesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsUp size={14} sm:size={16} />
                    <span className="hidden sm:inline">
                      {likeCount > 0 && `${likeCount}`}
                    </span>
                  </button>

                  <button
                    onClick={handleDislike}
                    disabled={likesLoading}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full text-sm transition-colors ${
                      disliked
                        ? "bg-red-500 text-white"
                        : `${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`
                    } ${likesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsDown size={14} />
                    {dislikeCount > 0 && <span>({dislikeCount})</span>}
                  </button>

                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full text-sm ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  {/* Save to Playlist Button */}
                  {currentUser && (
                    <button
                      onClick={openPlaylistModal}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full text-sm ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      <List size={14} />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                  )}
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
                className={`flex flex-col sm:flex-row sm:items-center justify-between border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } pt-6 gap-4`}
              >
                <Link to={`/channel/${video.owner?._id}`} className="flex-1">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {video.owner?.avatar ? (
                      <img
                        src={video.owner.avatar}
                        alt={video.owner?.fullName}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {video.owner?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-semibold text-sm sm:text-base truncate ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {video.owner?.fullName || "Unknown Creator"}
                      </h3>
                      {subscriberLoading ? (
                        <span
                          className={`text-xs sm:text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          } flex items-center gap-1`}
                        >
                          <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                          Loading...
                        </span>
                      ) : (
                        <p
                          className={`text-xs sm:text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {formatSubscriberCount(subscriberCount)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Updated Subscribe Button Section */}
                {/* Subscribe button - responsive sizing */}
                <div className="flex-shrink-0">
                  {subscriptionLoading ? (
                    <div className="px-4 sm:px-6 py-2 rounded-full bg-gray-100 flex items-center text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                      <span className="text-gray-600">Loading...</span>
                    </div>
                  ) : subscriptionData?.isOwnChannel ? (
                    <Link to="/channel">
                      <button
                        className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm transition-colors shadow-lg hover:shadow-xl flex items-center ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        <Settings
                          size={16}
                          sm:size={18}
                          className="mr-1 sm:mr-2"
                        />
                        <span className="hidden sm:inline">Manage Channel</span>
                        <span className="sm:hidden">Manage</span>
                      </button>
                    </Link>
                  ) : subscriptionData ? (
                    <button
                      onClick={handleSubscription}
                      disabled={isSubscribing}
                      className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center transform hover:scale-105 ${
                        subscriptionData.isSubscribed
                          ? `${
                              isDarkMode
                                ? "bg-gray-600 hover:bg-gray-700 text-white border border-gray-500"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300"
                            }`
                          : "bg-red-500 hover:bg-red-600 text-white border border-red-600"
                      } ${
                        isSubscribing
                          ? "opacity-50 cursor-not-allowed scale-100"
                          : ""
                      }`}
                    >
                      {isSubscribing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1 sm:mr-2"></div>
                          <span className="hidden sm:inline">
                            {subscriptionData.isSubscribed
                              ? "Unsubscribing..."
                              : "Subscribing..."}
                          </span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : subscriptionData.isSubscribed ? (
                        <>
                          <Bell
                            size={16}
                            className="mr-1 sm:mr-2 fill-current"
                          />
                          <span className="hidden sm:inline">Subscribed</span>
                          <span className="sm:hidden">Sub'd</span>
                        </>
                      ) : (
                        <>
                          <Bell size={16} className="mr-1 sm:mr-2" />
                          Subscribe
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm flex items-center ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-500"
                          : "bg-gray-100 text-gray-400"
                      } cursor-not-allowed`}
                    >
                      <Bell size={16} className="mr-1 sm:mr-2" />
                      Subscribe
                    </button>
                  )}
                </div>
              </div>
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

            {/* NEW: Comments Button for Small Screens */}
            <div className="block lg:hidden mb-6">
              <button
                onClick={() => setShowCommentsModal(true)}
                className={`w-full flex items-center justify-between p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg transition-all hover:shadow-xl transform hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle
                    size={20}
                    className={isDarkMode ? "text-blue-400" : "text-blue-500"}
                  />
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Comments ({comments.length})
                  </span>
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Tap to view
                </div>
              </button>
            </div>

            {/* Desktop Comments Section */}
            <div className="hidden lg:block">
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
                    <div className="flex gap-2 sm:gap-3 items-start">
                      {/* User Avatar - smaller on mobile */}
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.fullName || "User"}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm absolute top-0 left-0"
                          style={{
                            display: currentUser.avatar ? "none" : "flex",
                          }}
                        >
                          {(currentUser.fullName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      </div>

                      {/* Comment Input Container */}
                      <div className="flex-1 relative">
                        <div className="relative">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className={`w-full p-3 sm:p-4 pr-16 sm:pr-20 border-0 border-b-2 text-sm sm:text-base ${
                              isDarkMode
                                ? "border-gray-600 bg-transparent text-white placeholder-gray-400 focus:border-blue-400"
                                : "border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-blue-500"
                            } focus:outline-none transition-colors duration-200 resize-none`}
                            rows="3"
                            disabled={addingComment}
                            style={{
                              minHeight: "40px",
                              lineHeight: "1.5",
                            }}
                            onInput={(e) => {
                              e.target.style.height = "40px";
                              e.target.style.height =
                                Math.min(e.target.scrollHeight, 120) + "px";
                            }}
                          />

                          {/* Send Button Inside Textarea */}
                          <div className="absolute right-1 sm:right-2 bottom-1 sm:bottom-2 flex gap-1 sm:gap-2">
                            {newComment.trim() && (
                              <button
                                type="button"
                                onClick={() => setNewComment("")}
                                className={`p-1.5 sm:p-2 rounded-full ${
                                  isDarkMode
                                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                } transition-all duration-200`}
                                disabled={addingComment}
                              >
                                <X size={14} />
                              </button>
                            )}

                            <button
                              type="submit"
                              disabled={!newComment.trim() || addingComment}
                              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                                !newComment.trim() || addingComment
                                  ? isDarkMode
                                    ? "text-gray-600 cursor-not-allowed"
                                    : "text-gray-400 cursor-not-allowed"
                                  : "text-white bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-105"
                              }`}
                            >
                              {addingComment ? (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
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
                        {comment?.owner?.avatar ? (
                          <img
                            src={comment.owner.avatar}
                            alt={comment.owner?.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                            {comment.owner?.fullName
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
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

                            {currentUser._id === comment.owner?._id && (
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
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <div
              className={`${
                isDarkMode ? "bg-transparent" : "bg-transparent"
              } p-0 lg:p-6`}
            >
              <h3
                className={`text-base sm:text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4 sm:mb-6 flex items-center gap-2 px-4 lg:px-0`}
              >
                <PlayCircle size={18} />
                Related Videos
              </h3>

              {/* Related Videos List - Mobile & Desktop Responsive */}
              <div className="space-y-2 lg:space-y-4">
                {relatedVideos.length === 0 ? (
                  <div
                    className={`text-center py-8 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <PlayCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No related videos found</p>
                  </div>
                ) : (
                  relatedVideos
                    .slice(0, displayedVideosCount)
                    .map((relatedVideo) => (
                      <div
                        key={relatedVideo._id}
                        onClick={() =>
                          handleRelatedVideoClick(relatedVideo._id)
                        }
                        className={`group cursor-pointer transition-all duration-300 ease-in-out lg:flex lg:gap-3 lg:p-3 lg:rounded-lg
           
                ${
                  isDarkMode
                    ? "lg:hover:bg-gray-700/50 lg:bg-transparent hover:bg-gray-800/30"
                    : "lg:hover:bg-gray-100/70 lg:bg-transparent hover:bg-gray-50/70"
                }
           
                block lg:block px-4 lg:px-0 mb-4 lg:mb-0
              `}
                      >
                        {/* Mobile Layout */}
                        <div className="lg:hidden">
                          {/* Mobile Thumbnail - Full Width */}
                          <div className="relative w-full aspect-video mb-3 rounded-xl overflow-hidden">
                            <img
                              src={relatedVideo.thumbnail?.url}
                              alt={relatedVideo.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Duration Overlay */}
                            {relatedVideo.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-md">
                                {formatDuration(relatedVideo.duration)}
                              </div>
                            )}

                            {/* Play Icon Overlay - Larger for mobile */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="bg-black/60 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                <Play
                                  size={24}
                                  className="text-white fill-white ml-1"
                                />
                              </div>
                            </div>

                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          {/* Mobile Video Info */}
                          <div className="space-y-2">
                            <h4
                              className={`font-semibold text-base leading-tight ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              } line-clamp-2 group-hover:text-blue-500 transition-colors duration-200`}
                            >
                              {relatedVideo.title}
                            </h4>

                            {/* Channel Info */}
                            <div className="flex items-center gap-3">
                              {relatedVideo.owner?.avatar ? (
                                <img
                                  src={relatedVideo.owner.avatar}
                                  alt={relatedVideo.owner.fullName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                  {relatedVideo.owner?.fullName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  } truncate`}
                                >
                                  {relatedVideo.owner?.fullName ||
                                    "Unknown Creator"}
                                </p>
                                <div
                                  className={`flex items-center gap-2 text-xs ${
                                    isDarkMode
                                      ? "text-gray-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>
                                    {formatViews(relatedVideo.views)} views
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {formatDate(relatedVideo.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:flex lg:gap-3 lg:items-start">
                          {/* Desktop Thumbnail */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={relatedVideo.thumbnail?.url}
                              alt={relatedVideo.title}
                              className="w-40 h-24 object-cover rounded-lg transition-transform duration-300 "
                            />

                            {/* Duration Overlay */}
                            {relatedVideo.duration && (
                              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                {formatDuration(relatedVideo.duration)}
                              </div>
                            )}

                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-black/50 rounded-full p-2 transform scale-90 group-hover:scale-100 transition-transform duration-200">
                                <Play
                                  size={16}
                                  className="text-white fill-white ml-0.5"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Desktop Video Info */}
                          <div className="flex-1 min-w-0 ">
                            <h4
                              className={`font-medium text-sm ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              } line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors duration-200`}
                            >
                              {relatedVideo.title}
                            </h4>

                            {/* Channel Info */}
                            <div className="flex items-center gap-2 mb-2">
                              {relatedVideo.owner?.avatar ? (
                                <img
                                  src={relatedVideo.owner.avatar}
                                  alt={relatedVideo.owner.fullName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                  {relatedVideo.owner?.fullName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                                </div>
                              )}
                              <span
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                } truncate`}
                              >
                                {relatedVideo.owner?.fullName ||
                                  "Unknown Creator"}
                              </span>
                            </div>

                            {/* Video Stats */}
                            <div
                              className={`flex items-center gap-2 text-xs ${
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
                              <span>
                                {formatViews(relatedVideo.views)} views
                              </span>
                              <span>•</span>
                              <span>{formatDate(relatedVideo.createdAt)}</span>
                            </div>

                            {/* Description Preview - Desktop only */}
                            {relatedVideo.description && (
                              <p
                                className={`text-xs ${
                                  isDarkMode ? "text-gray-500" : "text-gray-500"
                                } line-clamp-2 mt-1`}
                              >
                                {relatedVideo.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Show More Button */}
              {relatedVideos.length > 5 && (
                <div className="mt-6 text-center px-4 lg:px-0">
                  <button
                    onClick={handleShowMoreRelated}
                    className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600 shadow-lg hover:shadow-xl"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {showingAllRelated
                      ? "Show Less"
                      : `Show More (${
                          relatedVideos.length - displayedVideosCount
                        } more)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailpage;
