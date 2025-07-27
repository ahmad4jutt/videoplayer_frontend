import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { useSearch } from "../../context/SearchContext";
import { useTheme } from "../../context/ThemeContext";
import { Menu, Search, X, Bell, User, Moon, Sun, LogOut } from "lucide-react";

const Navbar = ({ onSidebarToggle, isSidebarOpen }) => {
  //safety check
  const authContext = useAuth();
  if (!authContext) {
    console.log("Navbar must be used in Authprovider");
    return null;
  }
  const { currentUser, logout } = authContext;
  const { searchQuery, updateSearch, clearSearch } = useSearch();
  const { isDarkMode, toggleTheme } = useTheme();

  const userData = currentUser?.data || currentUser;
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Sync local search with global search state
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle search input change - update both local and global state
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    updateSearch(query); // This will trigger filtering in real-time
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    // Ensure the search is applied
    updateSearch(localSearchQuery);

    // Navigate to home page if not already there
    if (location.pathname !== "/") {
      navigate("/");
    }

    // Close mobile search if open
    setIsMobileSearchOpen(false);
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchQuery("");
    clearSearch();
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearSearch(); // Clear search on logout
      navigate("/");
    } catch (error) {
      console.log("Logout failed :", error);
    }
  };

  // Handle logo click to clear search and go home
  const handleLogoClick = () => {
    handleClearSearch();
    navigate("/");
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <div className="max-w-7xl mx-auto ">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Burger menu and Logo */}
            <div className="flex items-center">
              {/* Burger Menu Button */}
              <button
                onClick={onSidebarToggle}
                className={`mr-4 ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } p-2 rounded-md transition-colors`}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleLogoClick}
                  className="flex items-center hover:opacity-80 transition-opacity"
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
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  } rounded-md leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Search videos..."
                />
                {localSearchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                    } rounded-r-md transition-colors`}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
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
                  <button
                    className={`${
                      isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    } p-2 rounded-full transition-colors`}
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                  <div className="relative">
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
                          onError={(e) => {
                            console.log(
                              "Image failed to load:",
                              userData.avatar
                            );
                            e.target.style.display = "none";
                          }}
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
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearchQuery}
                onChange={handleSearchChange}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Search videos..."
                autoFocus
              />
              {localSearchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </form>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
