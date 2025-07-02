import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { getcurrentUser } from "../../services/api";
import { Menu, Search, X, Bell, User, Moon, Sun, LogOut } from "lucide-react";

const Navbar = () => {
  //safety check
  const authContext = useAuth();
  if (!authContext) {
    console.log("Navbar must be used in Authprovider");
    return null;
  }
  const { currentUser, logout } = authContext;
  console.log("current user are not fetching", currentUser);

  const userData = currentUser?.data || currentUser;
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  //replace localstorage usage with state-only
  // const [isDarkMode, setIsDarkMode] = useState(() => {
  //   if (typeof window !== "undefined" && window.localStorage) {
  //     return (
  //       localStorage.theme === "dark" ||
  //       (!("theme" in localStorage) &&
  //         window.matchMedia("(prefers-color-scheme: dark)").matches)
  //     );
  //   }
  //   return false; // default to light mode
  // });
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userPref = localStorage.getItem("theme");
      const systemPref = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const shouldUseDark = userPref === "dark" || (!userPref && systemPref);

      if (shouldUseDark) {
        document.documentElement.classList.add("dark");
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDarkMode(false);
      }
    }
  }, []);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleDarkMode = () => {
    if (typeof window !== "undefined") {
      if (isDarkMode) {
        document.documentElement.classList.remove("dark");
        if (window.localStorage) {
          localStorage.theme = "light";
        }
      } else {
        document.documentElement.classList.add("dark");
        if (window.localStorage) {
          localStorage.theme = "dark";
        }
      }
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.log("Logout failed :", error);
    }
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center">
                  <span className="text-red-600 text-2xl font-bold">Video</span>
                  <span className="text-gray-800 dark:text-white text-2xl font-bold">
                    Tube
                  </span>
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-xl mx-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search videos..."
                />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>

                {userData ? (
                  <>
                    <Link
                      to="/upload"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Upload
                    </Link>
                    <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full">
                      <Bell className="h-5 w-5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={toggleUserMenu}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
                          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                          <Link
                            to={`/profile/${userData?._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Search videos..."
                />
              </div>
            </div>

            <button
              onClick={toggleDarkMode}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 mr-2" />
              ) : (
                <Moon className="h-5 w-5 mr-2" />
              )}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>

            {userData ? (
              <>
                <Link
                  to="/upload"
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Upload Video
                </Link>
                <Link
                  to={`/profile/${userData?._id}`}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center w-full px-3 py-2 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
