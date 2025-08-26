// Simple fix: Move CommentsModal outside the main component and use React.memo
import React, { memo } from "react";
import { MessageCircle, X, Send, Edit, Trash2, ThumbsUp } from "lucide-react";

const CommentsModal = memo(
  ({
    showCommentsModal,
    setShowCommentsModal,
    isDarkMode,
    comments,
    commentsLoading,
    commentsError,
    currentUser,
    newComment,
    setNewComment,
    addingComment,
    handleAddComment,
    editingCommentId,
    setEditingCommentId,
    editingCommentText,
    setEditingCommentText,
    handleEditComment,
    handleDeleteComment,
    deletingCommentId,
    handleToggleCommentLike,
    formatDate,
  }) => {
    if (!showCommentsModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 lg:hidden">
        <div
          className={`${
            isDarkMode ? "bg-gray-900" : "bg-white"
          } w-full h-[90vh] rounded-t-2xl shadow-2xl overflow-hidden`}
          style={{
            animation: "slideUp 0.3s ease-out",
          }}
        >
          {/* Modal Header */}
          <div
            className={`sticky top-0 z-10 px-4 py-4 border-b flex items-center justify-between ${
              isDarkMode
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <MessageCircle size={20} />
              Comments ({comments.length})
            </h3>
            <button
              onClick={() => setShowCommentsModal(false)}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Add Comment Form */}
            {currentUser && (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex gap-3 items-start">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.fullName || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm absolute top-0 left-0"
                      style={{
                        display: currentUser.avatar ? "none" : "flex",
                      }}
                    >
                      {(currentUser.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className={`w-full p-4 pr-20 border-0 border-b-2 ${
                          isDarkMode
                            ? "border-gray-600 bg-transparent text-white placeholder-gray-400 focus:border-blue-400"
                            : "border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-blue-500"
                        } focus:outline-none transition-colors duration-200 resize-none`}
                        disabled={addingComment}
                      />

                      <div className="absolute right-2 bottom-2 flex gap-2">
                        {newComment.trim() && (
                          <button
                            type="button"
                            onClick={() => setNewComment("")}
                            className={`p-2 rounded-full ${
                              isDarkMode
                                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            } transition-all duration-200`}
                            disabled={addingComment}
                          >
                            <X size={16} />
                          </button>
                        )}

                        <button
                          type="submit"
                          disabled={!newComment.trim() || addingComment}
                          className={`p-2 rounded-full transition-all duration-200 ${
                            !newComment.trim() || addingComment
                              ? isDarkMode
                                ? "text-gray-600 cursor-not-allowed"
                                : "text-gray-400 cursor-not-allowed"
                              : "text-white bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:scale-105"
                          }`}
                        >
                          {addingComment ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>
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
                      isDarkMode ? "bg-gray-800" : "bg-gray-50"
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
                              onClick={(e) => handleEditComment(comment._id, e)}
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
    );
  }
);

// Add display name for debugging
CommentsModal.displayName = "CommentsModal";

export default CommentsModal;

// In your main component, replace the inline CommentsModal with:
// {showCommentsModal && <CommentsModal {...props} />}
