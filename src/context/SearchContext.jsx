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

  const updateSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Filter videos based on search query
  const filterVideos = (videos, query) => {
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

  const value = {
    searchQuery,
    updateSearch,
    clearSearch,
    filterVideos,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchContext;
