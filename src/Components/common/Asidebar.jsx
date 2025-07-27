import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useTheme } from "../../context/ThemeContext";

import {
  Home,
  Play,
  Clock,
  ThumbsUp,
  Users,
  List,
  History,
  BookMarked,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";

const Asidebar = ({ isOpen, onClose, isCollapsed, isVideoDetailPage }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  const isActive = (path) => {
    return location.pathname === path
      ? `bg-gray-100 ${isDarkMode ? "dark:bg-gray-700" : ""} text-red-600 ${
          isDarkMode ? "dark:text-red-400" : ""
        }`
      : `text-gray-700 ${
          isDarkMode ? "dark:text-gray-300" : ""
        } hover:bg-gray-100 ${isDarkMode ? "dark:hover:bg-gray-700" : ""}`;
  };

  const { channelId, videoId: userId } = useParams();

  const handleItemClick = () => {
    // Close sidebar when item is clicked on mobile or video detail page
    if (isVideoDetailPage || window.innerWidth < 1024) {
      onClose();
    }
  };

  // Show overlay only on mobile or on video detail page, not when sidebar is collapsed on desktop
  const showOverlay =
    (isVideoDetailPage || window.innerWidth < 1024) && !isCollapsed;

  return (
    <>
      {/* Overlay for mobile and video detail page */}
      {isOpen && showOverlay && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-screen bg-white ${
          isDarkMode ? "dark:bg-gray-800" : ""
        } border-r border-gray-200 ${
          isDarkMode ? "dark:border-gray-700" : ""
        } z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed && !isVideoDetailPage ? "w-20" : "w-64"}`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto pt-2 pb-4">
          <nav className="flex-1 px-2 space-y-1">
            <Link
              to="/"
              onClick={handleItemClick}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                "/"
              )}`}
              title={isCollapsed ? "Home" : ""}
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              {!isCollapsed && "Home"}
            </Link>

            {currentUser && (
              <>
                <Link
                  to="/subscribed-channels"
                  onClick={handleItemClick}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                    "/subscribed-channels"
                  )}`}
                  title={isCollapsed ? "Subscriptions" : ""}
                >
                  <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && "Subscriptions"}
                </Link>

                {!isCollapsed && (
                  <div className="pt-5">
                    <p
                      className={`px-3 text-xs font-semibold text-gray-500 ${
                        isDarkMode ? "dark:text-gray-400" : ""
                      } uppercase tracking-wider`}
                    >
                      Library
                    </p>
                    <div className="mt-2 space-y-1">
                      <Link
                        to="/history"
                        onClick={handleItemClick}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                          "/history"
                        )}`}
                      >
                        <History className="mr-3 h-5 w-5" />
                        History
                      </Link>

                      <Link
                        to={`/channel`}
                        onClick={handleItemClick}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                          "/channel"
                        )}`}
                      >
                        <Play className="mr-3 h-5 w-5" />
                        Your Channel
                      </Link>

                      <Link
                        to="/liked-videos"
                        onClick={handleItemClick}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                          "/liked-videos"
                        )}`}
                      >
                        <ThumbsUp className="mr-3 h-5 w-5" />
                        Liked Videos
                      </Link>
                    </div>
                  </div>
                )}

                {/* Collapsed state - show Library items as icons */}
                {isCollapsed && (
                  <>
                    <Link
                      to="/history"
                      onClick={handleItemClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                        "/history"
                      )}`}
                      title="History"
                    >
                      <History className="mr-3 h-5 w-5 flex-shrink-0" />
                    </Link>

                    <Link
                      to={`/channel`}
                      onClick={handleItemClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                        "/channel"
                      )}`}
                      title="Your Channel"
                    >
                      <Play className="mr-3 h-5 w-5 flex-shrink-0" />
                    </Link>

                    <Link
                      to="/liked-videos"
                      onClick={handleItemClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                        "/liked-videos"
                      )}`}
                      title="Liked Videos"
                    >
                      <ThumbsUp className="mr-3 h-5 w-5 flex-shrink-0" />
                    </Link>
                  </>
                )}

                {!isCollapsed && (
                  <div className="pt-5">
                    <p
                      className={`px-3 text-xs font-semibold text-gray-500 ${
                        isDarkMode ? "dark:text-gray-400" : ""
                      } uppercase tracking-wider`}
                    >
                      Playlists
                    </p>
                    <div className="mt-2 space-y-1">
                      <Link
                        to="/playlists"
                        onClick={handleItemClick}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                          "/playlists"
                        )}`}
                      >
                        <List className="mr-3 h-5 w-5" />
                        All Playlists
                      </Link>

                      <Link
                        to="/saved-playlists"
                        onClick={handleItemClick}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                          "/saved-playlists"
                        )}`}
                      >
                        <BookMarked className="mr-3 h-5 w-5" />
                        Saved Playlists
                      </Link>
                    </div>
                  </div>
                )}

                {/* Collapsed state - show Playlist items as icons */}
                {isCollapsed && (
                  <>
                    <Link
                      to="/playlists"
                      onClick={handleItemClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                        "/playlists"
                      )}`}
                      title="All Playlists"
                    >
                      <List className="mr-3 h-5 w-5 flex-shrink-0" />
                    </Link>

                    <Link
                      to="/saved-playlists"
                      onClick={handleItemClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                        "/saved-playlists"
                      )}`}
                      title="Saved Playlists"
                    >
                      <BookMarked className="mr-3 h-5 w-5 flex-shrink-0" />
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="pt-5">
              <div className="space-y-1">
                <Link
                  to="/settings"
                  onClick={handleItemClick}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                    "/settings"
                  )}`}
                  title={isCollapsed ? "Settings" : ""}
                >
                  <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && "Settings"}
                </Link>

                <Link
                  to="/help"
                  onClick={handleItemClick}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                    "/help"
                  )}`}
                  title={isCollapsed ? "Help" : ""}
                >
                  <HelpCircle className="mr-3 h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && "Help"}
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {!currentUser && !isCollapsed && (
          <div
            className={`p-4 border-t border-gray-200 ${
              isDarkMode ? "dark:border-gray-700" : ""
            }`}
          >
            <div className="text-center space-y-2">
              <p
                className={`text-sm text-gray-600 ${
                  isDarkMode ? "dark:text-gray-400" : ""
                }`}
              >
                Sign in to like videos, comment, and subscribe.
              </p>
              <Link
                to="/login"
                onClick={handleItemClick}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Asidebar;
