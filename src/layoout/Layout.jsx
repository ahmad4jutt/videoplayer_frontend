import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Components/common/Navbar";
import Asidebar from "../Components/common/Asidebar";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Check if current page is video detail page
  const isVideoDetailPage = location.pathname.startsWith("/video/");

  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;

      if (isVideoDetailPage) {
        // On video detail page, sidebar is hidden by default
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else if (isLargeScreen) {
        // On large screens (non-video pages), sidebar is open by default
        setIsSidebarOpen(true);
        setIsCollapsed(false);
      } else {
        // On smaller screens, sidebar is closed
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVideoDetailPage]);

  const toggleSidebar = () => {
    const isLargeScreen = window.innerWidth >= 1024;

    if (isVideoDetailPage) {
      // On video detail page, toggle between hidden and overlay
      setIsSidebarOpen(!isSidebarOpen);
      setIsCollapsed(false);
    } else if (isLargeScreen) {
      // On large screens (non-video pages), toggle between full, collapsed, and hidden
      if (isSidebarOpen && !isCollapsed) {
        // First toggle: collapse to icons
        setIsCollapsed(true);
      } else {
        setIsSidebarOpen(true);
        setIsCollapsed(false);
      }
    } else {
      // On smaller screens, toggle overlay
      setIsSidebarOpen(!isSidebarOpen);
      setIsCollapsed(false);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setIsCollapsed(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar onSidebarToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Sidebar */}
      <Asidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isCollapsed}
        isVideoDetailPage={isVideoDetailPage}
      />

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          isVideoDetailPage
            ? "ml-0" // No margin on video detail page
            : isSidebarOpen && !isCollapsed
            ? "lg:ml-64" // Full sidebar width on large screens
            : isSidebarOpen && isCollapsed
            ? "lg:ml-20" // Collapsed sidebar width on large screens
            : "ml-0" // No margin when sidebar is closed
        }`}
      >
        <div className="">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
