import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserPlus,
  Calendar,
  Filter,
  MoreVertical,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";
import { getUserChannelSubscriber } from "../services/api";

const Subscribers = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  const { token } = useAuth();
  const { channelId } = useParams();

  const fetchSubscribers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getUserChannelSubscriber(
        token,
        channelId,
        page,
        limit
      );
      setSubscribers(response.data.data.subscriber);
      setTotalPages(response.data.data.totalPages);
      setTotalCount(response.data.data.totalSubscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchSubscribers(1);
    }
  }, [channelId]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSubscribers(page);
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    if (!sub.subscriberDetails) return false;

    const fullName = sub.subscriberDetails.fullName || "";
    const userName = sub.subscriberDetails.userName || "";
    const searchTermLower = searchTerm.toLowerCase();

    return (
      fullName.toLowerCase().includes(searchTermLower) ||
      userName.toLowerCase().includes(searchTermLower)
    );
  });

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="mx-auto h-20 w-20 text-gray-300 mb-4">
        <Users size={80} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No subscribers found
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {searchTerm
          ? "No subscribers match your search criteria. Try adjusting your search terms."
          : "You don't have any subscribers yet. Share your channel to start growing your audience!"}
      </p>
    </div>
  );

  // const SubscriberCard = ({ subscriber }) => (
  //   <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-1">
  //     <div className="flex items-start space-x-4">
  //       <div className="relative">
  //         <img
  //           src={subscriber.subscriberDetails.avatar}
  //           alt={subscriber.subscriberDetails.fullName}
  //           className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-200"
  //         />
  //         <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
  //       </div>
  //       <div className="flex-1 min-w-0">
  //         <div className="flex items-center justify-between">
  //           <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
  //             {subscriber.subscriberDetails.fullName}
  //           </h3>
  //           {/* <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100">
  //             <MoreVertical className="h-4 w-4 text-gray-500" />
  //           </button> */}
  //         </div>
  //         <p className="text-sm text-gray-500 truncate mb-2">
  //           @{subscriber.subscriberDetails.userName}
  //         </p>
  //         <div className="flex items-center text-xs text-gray-400 mb-4">
  //           <Calendar className="h-3 w-3 mr-1" />
  //           <span>Subscribed recently</span>
  //         </div>
  //         <div className="flex items-center justify-between">
  //           <div className="flex items-center space-x-2">
  //             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  //               <UserPlus className="h-3 w-3 mr-1" />
  //               Active
  //             </span>
  //           </div>
  //           {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 transition-colors group-hover:border-blue-400">
  //             <Eye className="h-4 w-4 mr-2" />
  //             View Profile
  //           </button> */}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const StatCard = ({ icon, label, value, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
      <div className="flex items-center text-sm text-gray-600">
        <span className="font-medium">
          Showing {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, totalCount)} of {totalCount}{" "}
          subscribers
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? "z-10 bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Subscribers
          </h1>
          <p className="text-gray-600">
            Manage and view your channel subscribers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6 text-blue-600" />}
            label="Total Subscribers"
            value={totalCount.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={<UserPlus className="h-6 w-6 text-green-600" />}
            label="Active Subscribers"
            value={filteredSubscribers.length.toLocaleString()}
            color="green"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6 text-purple-600" />}
            label="This Month"
            value="0"
            color="purple"
          />
        </div>

        {/* Main Content */}
      </div>
    </div>
  );
};

export default Subscribers;
