import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // This is what actually filters
  const [searchType, setSearchType] = useState("videos"); // "videos" or "users"
  const [isSearching, setIsSearching] = useState(false);

  // Update the input field only (not the active search)
  const updateSearchInput = (query) => {
    setSearchQuery(query);
  };

  // Execute the search (called on submit/enter)
  const executeSearch = (query = searchQuery, type = searchType) => {
    setIsSearching(true);
    setActiveSearchQuery(query.trim());
    setSearchType(type);

    // Simulate search delay for better UX
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  // Clear both input and active search
  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setSearchType("videos");
    setIsSearching(false);
  };

  // Set search type (videos or users)
  const setSearchTypeHandler = (type) => {
    setSearchType(type);
    if (activeSearchQuery) {
      executeSearch(activeSearchQuery, type);
    }
  };

  // Filter videos based on search query
  const filterVideos = (videos, query = activeSearchQuery) => {
    if (!query || query.trim() === "") {
      return videos; // Return all videos if no search query
    }

    const searchTerm = query.toLowerCase().trim();
    return videos.filter((video) => {
      // Search in video title
      const titleMatch = video.title?.toLowerCase().includes(searchTerm);

      // Search in video description
      const descriptionMatch = video.description
        ?.toLowerCase()
        .includes(searchTerm);

      // Search in video tags (if they exist)
      const tagsMatch = video.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );

      // Search in owner/creator username
      const ownerMatch =
        video.owner?.username?.toLowerCase().includes(searchTerm) ||
        video.createdBy?.username?.toLowerCase().includes(searchTerm) ||
        video.createdBy?.fullName?.toLowerCase().includes(searchTerm) ||
        video.creator?.username?.toLowerCase().includes(searchTerm);

      // Search in category (if exists)
      const categoryMatch = video.category?.toLowerCase().includes(searchTerm);

      // Return true if any field matches
      return (
        titleMatch ||
        descriptionMatch ||
        tagsMatch ||
        ownerMatch ||
        categoryMatch
      );
    });
  };

  // Filter users based on search query (you'll need to implement this based on your user API)
  const filterUsers = (users, query = activeSearchQuery) => {
    if (!query || query.trim() === "") {
      return users;
    }

    const searchTerm = query.toLowerCase().trim();
    return users.filter((user) => {
      const usernameMatch = user.username?.toLowerCase().includes(searchTerm);
      const fullNameMatch = user.fullName?.toLowerCase().includes(searchTerm);
      const emailMatch = user.email?.toLowerCase().includes(searchTerm);

      return usernameMatch || fullNameMatch || emailMatch;
    });
  };

  const value = {
    // Input state (what user is typing)
    searchQuery,
    updateSearchInput,

    // Active search state (what's actually filtering)
    activeSearchQuery,
    executeSearch,

    // Search type and status
    searchType,
    setSearchType: setSearchTypeHandler,
    isSearching,

    // Actions
    clearSearch,

    // Filtering functions
    filterVideos,
    filterUsers,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchContext;
