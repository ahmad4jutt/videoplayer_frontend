import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getAllVideos,
  toggleVideoLike,
  getVideoWithLikeStatus,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  toggleSubscription,
  isUserSubscribed,
} from "../../services/api";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Send,
  X,
  Edit,
  Trash2,
  UserPlus,
  UserCheck,
  Music,
  Bookmark,
} from "lucide-react";

const ShortsPage = () => {
  const { videoId } = useParams();
  const { currentUser, token } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Refs
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hasInitialized = useRef(false);

  // Video states
  const [video, setVideo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likesLoading, setLikesLoading] = useState(false);

  // Comments states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Subscription states
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch video like status
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

  // Fetch subscription status
  const checkSubscriptionStatus = async (channelId) => {
    if (!token || !channelId) return;

    try {
      const response = await isUserSubscribed(token, channelId);
      setSubscriptionData(response.data.data);
    } catch (err) {
      setSubscriptionData(null);
    }
  };

  // Fetch all videos and find current one
  const fetchAllVideos = useCallback(async () => {
    if (!token || hasInitialized.current) return;

    try {
      setLoading(true);
      setError(null);
      hasInitialized.current = true;

      // Fetch all videos
      const videosResponse = await getAllVideos(token);

      let videosData = [];
      // Handle your specific API response structure
      if (
        videosResponse?.data?.data?.videos &&
        Array.isArray(videosResponse.data.data.videos)
      ) {
        videosData = videosResponse.data.data.videos;
      } else if (
        videosResponse?.data?.videos &&
        Array.isArray(videosResponse.data.videos)
      ) {
        videosData = videosResponse.data.videos;
      }

      if (!videosData || videosData.length === 0) {
        setError("No videos found");
        return;
      }

      // Process videos and add owner field from createdBy
      const processedVideos = videosData.map((video) => ({
        ...video,
        owner: video.createdBy || video.owner, // Map createdBy to owner for consistency
      }));

      // Filter for short videos (you might want to adjust this criteria)
      const shortVideos = processedVideos.filter((video) => {
        // Assuming shorts are videos with duration <= 60 seconds
        // Adjust this logic based on your app's definition of shorts
        return video.duration <= 60 || video.isShort === true;
      });

      if (shortVideos.length === 0) {
        setError("No short videos found");
        return;
      }

      setAllVideos(shortVideos);

      // Find current video by ID
      let currentVideo = null;
      let videoIndex = 0;

      if (videoId) {
        const foundIndex = shortVideos.findIndex((v) => v._id === videoId);
        if (foundIndex !== -1) {
          currentVideo = shortVideos[foundIndex];
          videoIndex = foundIndex;
        } else {
          // If specific video not found, default to first video
          currentVideo = shortVideos[0];
          videoIndex = 0;
        }
      } else {
        // No specific video ID, start with first video
        currentVideo = shortVideos[0];
        videoIndex = 0;
      }

      setVideo(currentVideo);
      setCurrentIndex(videoIndex);

      // Fetch like status for current video
      if (currentVideo) {
        const likeStatus = await fetchVideoLikeStatus();
        setLiked(likeStatus.liked);
        setLikeCount(likeStatus.likeCount);

        // Check subscription status - use owner._id since we mapped createdBy to owner
        if (currentVideo.owner?._id) {
          await checkSubscriptionStatus(currentVideo.owner._id);
        }
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [token, videoId, fetchVideoLikeStatus]);

  // Fetch comments
  const fetchVideoComments = useCallback(async () => {
    if (!token || !videoId || commentsLoading) return;

    try {
      setCommentsLoading(true);
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

      setComments(commentsData);
    } catch (err) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [token, videoId, commentsLoading]);

  // Handle like
  const handleLike = async () => {
    if (!token || !video?._id || likesLoading) return;

    try {
      setLikesLoading(true);
      const response = await toggleVideoLike(token, video._id);
      const responseData = response?.data?.data || response?.data;

      if (responseData) {
        const newLikedState =
          responseData.liked !== undefined ? responseData.liked : !liked;
        const newLikeCount =
          responseData.totalLikes !== undefined
            ? responseData.totalLikes
            : newLikedState
            ? likeCount + 1
            : Math.max(0, likeCount - 1);

        setLiked(newLikedState);
        setLikeCount(newLikeCount);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikesLoading(false);
    }
  };

  // Handle subscription
  const handleSubscription = async () => {
    if (!video?.owner?._id || subscriptionData?.isOwnChannel) return;

    try {
      setIsSubscribing(true);
      const response = await toggleSubscription(token, video.owner._id);

      setSubscriptionData((prev) => ({
        ...prev,
        isSubscribed: response.data.data.subscribed,
      }));
    } catch (err) {
      console.error("Error toggling subscription:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle comment actions
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token || !videoId || !newComment.trim() || addingComment) return;

    try {
      setAddingComment(true);
      const response = await addComment(token, videoId, {
        content: newComment.trim(),
      });

      let newCommentData =
        response?.data?.comment ||
        response?.data?.data?.comment ||
        response?.data?.data;

      if (newCommentData) {
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
    } finally {
      setAddingComment(false);
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!token || !commentId) return;

    try {
      await toggleCommentLike(token, commentId);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            const wasLiked = comment.isLiked;
            return {
              ...comment,
              isLiked: !wasLiked,
              likesCount: wasLiked
                ? Math.max(0, (comment.likesCount || 0) - 1)
                : (comment.likesCount || 0) + 1,
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Error toggling comment like:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token) return;

    try {
      await deleteComment(token, commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // Video controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle video ended - auto play next
  const handleVideoEnd = () => {
    if (allVideos.length > 0) {
      const nextIndex = (currentIndex + 1) % allVideos.length;
      const nextVideo = allVideos[nextIndex];
      if (nextVideo) {
        navigate(`/shorts/${nextVideo._id}`);
      }
    }
  };

  // Navigation handlers
  const goToNextShort = () => {
    if (allVideos.length > 0) {
      const nextIndex = (currentIndex + 1) % allVideos.length;
      const nextVideo = allVideos[nextIndex];
      if (nextVideo) {
        navigate(`/shorts/${nextVideo._id}`);
      }
    }
  };

  const goToPrevShort = () => {
    if (allVideos.length > 0) {
      const prevIndex =
        currentIndex === 0 ? allVideos.length - 1 : currentIndex - 1;
      const prevVideo = allVideos[prevIndex];
      if (prevVideo) {
        navigate(`/shorts/${prevVideo._id}`);
      }
    }
  };

  // Format functions
  const formatViews = (views) => {
    if (!views || views === 0) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatLikes = (likes) => {
    if (!likes || likes === 0) return "0";
    if (likes >= 1000000) return `${(likes / 1000000).toFixed(1)}M`;
    if (likes >= 1000) return `${(likes / 1000).toFixed(1)}K`;
    return likes.toString();
  };

  // Initialize
  useEffect(() => {
    if (token && !hasInitialized.current) {
      fetchAllVideos();
    }
  }, [token, fetchAllVideos]);

  useEffect(() => {
    if (video && videoId && token) {
      fetchVideoComments();
    }
  }, [video, videoId, token]);

  // Reset when videoId changes
  useEffect(() => {
    if (videoId && allVideos.length > 0) {
      const foundIndex = allVideos.findIndex((v) => v._id === videoId);
      if (foundIndex !== -1) {
        setCurrentIndex(foundIndex);
        setVideo(allVideos[foundIndex]);
        setComments([]);
        setLiked(false);
        setLikeCount(0);
        setSubscriptionData(null);
        setShowComments(false);

        // Fetch new video data
        fetchVideoLikeStatus().then((likeStatus) => {
          setLiked(likeStatus.liked);
          setLikeCount(likeStatus.likeCount);
        });

        // Use owner._id since we mapped createdBy to owner
        if (allVideos[foundIndex].owner?._id) {
          checkSubscriptionStatus(allVideos[foundIndex].owner._id);
        }
      }
    }
  }, [videoId, allVideos]);

  // Touch/swipe handlers for mobile
  useEffect(() => {
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      const deltaY = startY - endY;
      const deltaTime = endTime - startTime;

      // Swipe detection (minimum distance and maximum time)
      if (Math.abs(deltaY) > 50 && deltaTime < 500) {
        if (deltaY > 0) {
          // Swipe up - next video
          goToNextShort();
        } else {
          // Swipe down - previous video
          goToPrevShort();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart);
      container.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [currentIndex, allVideos]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Short Not Found</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-black px-6 py-2 rounded-full font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden select-none"
    >
      {/* Video Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Main Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={video.videoFile?.url}
          poster={video.thumbnail?.url}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnd}
          onClick={togglePlayPause}
        />

        {/* Play/Pause Overlay */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-4">
              {isPlaying ? (
                <Pause size={48} className="text-white" />
              ) : (
                <Play size={48} className="text-white" />
              )}
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        {allVideos.length > 0 && (
          <>
            <button
              onClick={goToPrevShort}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            >
              <ArrowUp size={24} />
            </button>
            <button
              onClick={goToNextShort}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            >
              <ArrowDown size={24} />
            </button>
          </>
        )}

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
          {/* Creator Avatar + Subscribe */}
          <div className="relative">
            <Link to={`/channel/${video.owner?._id}`}>
              {video.owner?.avatar ? (
                <img
                  src={video.owner.avatar}
                  alt={video.owner?.fullName}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold border-2 border-white">
                  {video.owner?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </Link>

            {/* Subscribe Button */}
            {!subscriptionData?.isOwnChannel && (
              <button
                onClick={handleSubscription}
                disabled={isSubscribing}
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white transition-all ${
                  subscriptionData?.isSubscribed
                    ? "bg-gray-600"
                    : "bg-red-500 hover:bg-red-600"
                } ${isSubscribing ? "opacity-50" : ""}`}
              >
                {subscriptionData?.isSubscribed ? (
                  <UserCheck size={14} />
                ) : (
                  <UserPlus size={14} />
                )}
              </button>
            )}
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLike}
              disabled={likesLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                liked
                  ? "bg-red-500 text-white"
                  : "bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              } ${likesLoading ? "opacity-50" : ""}`}
            >
              <Heart size={24} className={liked ? "fill-current" : ""} />
            </button>
            <span className="text-white text-xs mt-1 font-medium">
              {formatLikes(likeCount)}
            </span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowComments(true)}
              className="w-12 h-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 flex items-center justify-center transition-all"
            >
              <MessageCircle size={24} />
            </button>
            <span className="text-white text-xs mt-1 font-medium">
              {comments.length}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: video.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="w-12 h-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 flex items-center justify-center transition-all"
            >
              <Share2 size={24} />
            </button>
          </div>

          {/* More Options */}
          <button className="w-12 h-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 flex items-center justify-center transition-all">
            <MoreVertical size={24} />
          </button>

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 flex items-center justify-center transition-all"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="text-white">
            <h3 className="font-semibold mb-2 pr-20">{video.title}</h3>
            <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
              <span>{formatViews(video.views)} views</span>
            </div>
            {video.description && (
              <p className="text-sm opacity-75 line-clamp-2 pr-20">
                {video.description}
              </p>
            )}
            {/* Music/Audio Info */}
            <div className="flex items-center gap-2 mt-2 text-sm opacity-75">
              <Music size={16} />
              <span>Original audio • {video.owner?.fullName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[80vh] flex flex-col">
            {/* Comments Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">
                Comments ({comments.length})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageCircle
                    size={48}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    {comment?.owner?.avatar ? (
                      <img
                        src={comment.owner.avatar}
                        alt={comment.owner?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {comment.owner?.fullName?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm dark:text-white">
                          {comment.owner?.fullName || "Anonymous"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleCommentLike(comment._id)}
                          className={`flex items-center gap-1 text-xs ${
                            comment.isLiked
                              ? "text-red-500"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <Heart
                            size={12}
                            className={comment.isLiked ? "fill-current" : ""}
                          />
                          <span>{comment.likesCount || 0}</span>
                        </button>
                        {currentUser?._id === comment.owner?._id && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            {currentUser && (
              <div className="p-4 border-t dark:border-gray-700">
                <form onSubmit={handleAddComment} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {(currentUser.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={addingComment}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || addingComment}
                      className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                    >
                      {addingComment ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortsPage;
