import React from "react";
import { Home, ArrowLeft } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const NotFoundPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4  ${
        isDarkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div
            className={`text-6xl md:text-8xl font-bold mb-4 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            404
          </div>
        </div>

        {/* Main content */}
        <h1
          className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDarkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Page Not Found
        </h1>

        <p
          className={`text-lg mb-8 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="/"
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </a>

          <button
            onClick={() => window.history.back()}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
