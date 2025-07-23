import React, { useState, useEffect } from "react";
import { UserPlus, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { getSubscribedChannels } from "../services/api";

const SubscribedChannels = () => {
  const navigate = useNavigate();
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  const { token, currentUser } = useAuth();

  const fetchSubscribedChannels = async (page = 1) => {
    setLoading(true);
    try {
      const currentUserId = currentUser?.id || currentUser?._id;

      if (!currentUserId) {
        console.error("User ID not available");
        setLoading(false);
        return;
      }

      const response = await getSubscribedChannels(
        token,
        currentUserId,
        page,
        limit
      );
      setSubscribedChannels(response.data.data.subscribedChannels);
      setTotalPages(response.data.data.totalPages);
      setTotalCount(response.data.data.totalSubscribedChannels);
    } catch (error) {
      console.error("Error fetching subscribed channels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels(1);
  }, [currentUser]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSubscribedChannels(page);
  };

  const handleChannelClick = (channelId) => {
    navigate(`/channel/${channelId}`);
  };

  const filteredChannels = subscribedChannels.filter((channel) => {
    if (!channel.channelDetails) return false;

    const fullName = channel.channelDetails.fullName || "";
    const userName = channel.channelDetails.userName || "";
    const searchTermLower = searchTerm.toLowerCase();

    return (
      fullName.toLowerCase().includes(searchTermLower) ||
      userName.toLowerCase().includes(searchTermLower)
    );
  });

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-gray-400">
        <UserPlus size={48} />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No subscribed channels found
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        No subscribed channels to display yet.
      </p>
    </div>
  );

  const ChannelCard = ({ channel }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {channel.channelDetails.coverImage && (
          <img
            src={channel.channelDetails.coverImage}
            alt="Channel cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <img
            src={channel.channelDetails.avatar}
            alt={channel.channelDetails.fullName}
            className="h-10 w-10 rounded-full object-cover border-2 border-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {channel.channelDetails.fullName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              @{channel.channelDetails.userName}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => handleChannelClick(channel._id)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-1 cursor-pointer" />
            Visit
          </button>
        </div>
      </div>
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        Showing {(currentPage - 1) * limit + 1} to{" "}
        {Math.min(currentPage * limit, totalCount)} of {totalCount} results
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                currentPage === page
                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Subscribed Channels ({totalCount})
            </h1>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <LoadingSpinner />
            ) : filteredChannels.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredChannels.map((channel) => (
                  <ChannelCard key={channel._id} channel={channel} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredChannels.length > 0 && <Pagination />}
        </div>
      </div>
    </div>
  );
};

export default SubscribedChannels;
