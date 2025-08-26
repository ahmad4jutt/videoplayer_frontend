import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useSearch } from "../../context/SearchContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Menu,
  Search,
  X,
  Bell,
  User,
  Moon,
  Sun,
  LogOut,
  Video,
} from "lucide-react";
import NotificationModal from "./NotificationModal";

const Navbar = ({ onSidebarToggle, isSidebarOpen }) => {
  //safety check
  const authContext = useAuth();
  if (!authContext) {
    return null;
  }

  const { currentUser, logout } = authContext;
  const {
    searchQuery,
    updateSearchInput,
    executeSearch,
    clearSearch,
    isSearching,
  } = useSearch();
  const { isDarkMode, toggleTheme } = useTheme();

  const userData = currentUser?.data || currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false); // Add notification modal state
  const [notificationCount, setNotificationCount] = useState(0);
  // Handle search input change - only update input, don't execute search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    updateSearchInput(query);
  };

  // Handle search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    try {
      executeSearch(searchQuery, "videos");
      if (location.pathname !== "/") {
        navigate("/");
      }
    } catch (error) {
      console.error("Search failed:", error);

      executeSearch(searchQuery, "videos");
    }

    // Close mobile search if open
    setIsMobileSearchOpen(false);
  };

  // Clear search
  const handleClearSearch = () => {
    clearSearch();
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  // Handle notification bell click
  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearSearch(); // Clear search on logout
      navigate("/login");
    } catch (error) {}
  };

  // Handle logo click to clear search and go home
  const handleLogoClick = () => {
    handleClearSearch();
    navigate("/");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <div className="max-w-7xl mx-auto ">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center lg:-mx-7">
              <button
                onClick={onSidebarToggle}
                className={`mr-1 ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700 "
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } p-2 rounded-md cursor-pointer transition-colors`}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleLogoClick}
                  className="flex items-center hover:opacity-80 cursor-pointer transition-opacity"
                >
                  <span className="text-red-600 text-2xl font-bold">Vid</span>
                  <span
                    className={`${
                      isDarkMode ? "text-white" : "text-gray-800"
                    } text-2xl font-bold`}
                  >
                    zio
                  </span>
                </button>
              </div>
            </div>

            {/* Center - Search Bar (Desktop) */}
            <div className="hidden md:block flex-1 max-w-xl mx-6">
              <form onSubmit={handleSearchSubmit} className="relative flex">
                {/* Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={`block w-full pl-4 pr-20 py-2 border ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    } rounded-l-md leading-5 focus:outline-none  `}
                    placeholder="Search videos..."
                  />

                  {/* Clear button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                      } p-1 rounded transition-colors`}
                    >
                      <X className="h-4  text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className={`px-4 py-2 border rounded-r-md transition-colors ${
                    !searchQuery.trim() || isSearching
                      ? isDarkMode
                        ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                      : isDarkMode
                      ? "bg-gray-600 border-gray-600 text-white hover:bg-gray-700"
                      : "bg-gray-600 border-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {isSearching ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </form>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {/* Mobile Search Button */}
              <button
                onClick={toggleMobileSearch}
                className={`md:hidden ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } p-2 rounded-md transition-colors`}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } p-2 rounded-full transition-colors`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* User Actions */}
              {userData ? (
                <>
                  <Link
                    to="/upload"
                    className="hidden sm:block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Upload
                  </Link>

                  {/* Notification Bell - Updated to open modal instead of navigating */}
                  <button
                    onClick={handleNotificationClick}
                    className={`${
                      isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    } p-2 rounded-full  relative`}
                  >
                    <Bell className="h-5 w-5 " />
                    {/* Optional: Add notification badge */}
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-2 w-2 flex items-center justify-center"></span>
                  </button>

                  <div className="relative user-menu-container">
                    <button
                      onClick={toggleUserMenu}
                      className={`flex items-center ${
                        isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-gray-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      } rounded-full p-1 transition-colors`}
                    >
                      {userData.avatar ? (
                        <img
                          src={userData.avatar}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`h-8 w-8 rounded-full ${
                            isDarkMode ? "bg-gray-600" : "bg-gray-300"
                          } flex items-center justify-center`}
                        >
                          <User
                            className={`h-5 w-5 ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          />
                        </div>
                      )}
                    </button>

                    {isUserMenuOpen && (
                      <div
                        className={`absolute right-0 mt-2 w-48 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        } rounded-md shadow-lg py-1 z-10 border`}
                      >
                        <Link
                          to={`/profile/${userData?._id}`}
                          className={`block px-4 py-2 text-sm ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          } transition-colors`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          className={`block px-4 py-2 text-sm ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          } transition-colors`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/upload"
                          className={`sm:hidden block px-4 py-2 text-sm ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          } transition-colors`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Upload Video
                        </Link>
                        <button
                          onClick={handleLogout}
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          } transition-colors`}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div
            className={`md:hidden ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-t px-4 py-3`}
          >
            <form onSubmit={handleSearchSubmit}>
              {/* Search Input */}
              <div className="relative flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={`flex-1 pl-4 pr-12 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  } rounded-l-md focus:outline-none `}
                  placeholder="Search videos..."
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className={`px-4 py-2 rounded-r-md transition-colors ${
                    !searchQuery.trim() || isSearching
                      ? isDarkMode
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {isSearching ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
