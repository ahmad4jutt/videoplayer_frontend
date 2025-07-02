import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";

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
} from "lucide-react";

const Asidebar = () => {
  const location = useLocation();

  const { currentUser, dwqdwqdw } = useAuth();

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
  };

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-16 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-2 space-y-1">
          <Link
            to="/"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
              "/"
            )}`}
          >
            <Home className="mr-3 h-5 w-5" />
            Home
          </Link>

          {currentUser && (
            <>
              <Link
                to="/subscriptions"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                  "/subscriptions"
                )}`}
              >
                <Users className="mr-3 h-5 w-5" />
                Subscriptions
              </Link>

              <div className="pt-5">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Library
                </p>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/history"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                      "/history"
                    )}`}
                  >
                    <History className="mr-3 h-5 w-5" />
                    History
                  </Link>

                  <Link
                    to="/my-videos"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                      "/my-videos"
                    )}`}
                  >
                    <Play className="mr-3 h-5 w-5" />
                    Your Videos
                  </Link>

                  <Link
                    to="/watch-later"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                      "/watch-later"
                    )}`}
                  >
                    <Clock className="mr-3 h-5 w-5" />
                    Watch Later
                  </Link>

                  <Link
                    to="/liked-videos"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                      "/liked-videos"
                    )}`}
                  >
                    <ThumbsUp className="mr-3 h-5 w-5" />
                    Liked Videos
                  </Link>
                </div>
              </div>

              <div className="pt-5">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Playlists
                </p>
                <div className="mt-2 space-y-1">
                  <Link
                    to="/playlists"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                      "/playlists"
                    )}`}
                  >
                    <List className="mr-3 h-5 w-5" />
                    All Playlists
                  </Link>

                  <Link
                    to="/saved-playlists"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                      "/saved-playlists"
                    )}`}
                  >
                    <BookMarked className="mr-3 h-5 w-5" />
                    Saved Playlists
                  </Link>
                </div>
              </div>
            </>
          )}

          <div className="pt-5">
            <div className="space-y-1">
              <Link
                to="/settings"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                  "/settings"
                )}`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>

              <Link
                to="/help"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive(
                  "/help"
                )}`}
              >
                <HelpCircle className="mr-3 h-5 w-5" />
                Help
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {!currentUser && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign in to like videos, comment, and subscribe.
            </p>
            <Link
              to="/login"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asidebar;
