import React from "react";
import Navbar from "../Components/common/Navbar";
import Asidebar from "../Components/common/Asidebar";
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main container with sidebar and content */}
      <div className="flex">
        {/* Fixed Sidebar */}
        <Asidebar />

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 md:ml-64 pt-16 min-h-screen overflow-y-auto">
          <div className="">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
