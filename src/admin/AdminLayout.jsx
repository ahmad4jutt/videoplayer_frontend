import React, { useContext, useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAuth } from "../hooks/UseAuth";
import { useTheme } from "../context/ThemeContext";
import {
  MenuIcon,
  XIcon,
  HomeIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  ShieldIcon,
  BarChart3Icon,
  BellIcon,
  UserIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";

const AdminLayout = () => {
  const { currentAdmin, logoutAdmin, adminLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  // Extract admin data from the nested response structure
  const adminData =
    currentAdmin?.data?.admin || currentAdmin?.admin || currentAdmin;

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation items - using relative paths
  const navigationItems = [
    {
      name: "Dashboard",
      href: "dashboard",
      icon: HomeIcon,
    },
    {
      name: "Users",
      href: "users",
      icon: UsersIcon,
    },
    {
      name: "Analytics",
      href: "analytics",
      icon: BarChart3Icon,
    },
    {
      name: "Admins",
      href: "admins",
      icon: ShieldIcon,
    },
    {
      name: "Settings",
      href: "settings",
      icon: SettingsIcon,
    },
  ];

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen theme-bg-primary theme-transition">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600"></div>
          <p className="theme-text-secondary text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen theme-bg-primary theme-transition">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-72 theme-bg-secondary shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r theme-border theme-transition`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 theme-bg-sidebar theme-text-white">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center mr-3">
              <ShieldIcon className="h-5 w-5 text-slate-200" />
            </div>
            <h1 className="text-lg font-semibold  tracking-tight">
              <span className="text-red-600 text-lg font-semiboldbold">
                Vid
              </span>
              <span className="text-gray-800 dark:text-white text-lg font-semiboldbold">
                zio Admin Console
              </span>
            </h1>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-slate-300 hover:text-white transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="px-6 py-6 theme-bg-tertiary border-b theme-border theme-transition">
          <div className="flex items-center">
            {adminData?.avatar ? (
              <img
                src={adminData.avatar}
                alt={adminData.fullName || adminData.userName || "Admin"}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200"
              />
            ) : (
              <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-semibold theme-text-primary truncate theme-transition">
                {adminData?.fullName || adminData?.userName || "Admin"}
              </p>
              <p className="text-xs theme-text-secondary truncate theme-transition">
                {adminData?.email || "admin@example.com"}
              </p>
              {adminData?.role && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                    {adminData.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname.endsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 theme-transition ${
                      isActive
                        ? "theme-active-bg theme-text-white shadow-lg"
                        : "theme-text-primary theme-hover-bg"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive
                            ? "theme-text-white"
                            : "theme-text-secondary group-hover:theme-text-primary"
                        } theme-transition`}
                      />
                      {item.name}
                    </div>
                    {isActive && (
                      <ChevronRightIcon className="h-4 w-4 theme-text-tertiary" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-2 border-t theme-border theme-transition">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-3 text-sm font-medium theme-text-primary theme-hover-bg rounded-xl transition-all duration-200 group theme-transition"
          >
            {isDarkMode ? (
              <SunIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            ) : (
              <MoonIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t theme-border theme-transition">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
          >
            <LogOutIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="theme-bg-secondary shadow-sm border-b theme-border theme-transition">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="lg:hidden theme-text-secondary hover:theme-text-primary mr-4 p-2 rounded-lg theme-hover-bg transition-colors theme-transition"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold theme-text-primary tracking-tight theme-transition">
                  {navigationItems.find((item) =>
                    location.pathname.endsWith(item.href)
                  )?.name || "Admin"}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle for Header */}
              <button
                onClick={toggleTheme}
                className="p-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-colors theme-transition"
                title={
                  isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* <button className="relative p-2 theme-text-secondary hover:theme-text-primary theme-hover-bg rounded-lg transition-colors theme-transition">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button> */}

              <div className="flex items-center space-x-3 pl-4 border-l theme-border">
                {adminData?.avatar ? (
                  <img
                    src={adminData.avatar}
                    alt={adminData.fullName || adminData.userName || "Admin"}
                    className="w-9 h-9 rounded-lg object-cover ring-2 ring-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 bg-slate-600 rounded-lg flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium theme-text-primary theme-transition">
                    {adminData?.fullName || adminData?.userName || "Admin"}
                  </p>
                  <p className="text-xs theme-text-secondary theme-transition">
                    {adminData?.role || "Administrator"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto theme-bg-primary theme-transition">
          <div className="max-w-7xl mx-auto ">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
