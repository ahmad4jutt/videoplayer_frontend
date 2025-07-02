// import React, { useState, useEffect } from "react";
// import {
//   Eye,
//   ThumbsUp,
//   Users,
//   Video,
//   Calendar,
//   TrendingUp,
//   Play,
//   Clock,
//   MoreVertical,
//   Search,
//   Filter,
//   ChevronLeft,
//   ChevronRight,
//   Upload,
//   Download,
//   Edit3,
//   Trash2,
//   CheckSquare,
//   Square,
//   BarChart3,
//   PieChart,
//   Activity,
// } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   PieChart as RechartsPieChart,
//   Cell,
//   Pie,
// } from "recharts";
// import { toast } from "react-toastify";
// import {
//   deleteVideo,
//   getChannelStats,
//   getChannelVideos as getChannelVideo,
//   togglePublishStatus,
// } from "../../services/api";
// import Layout from "../../layoout/Layout";
// const Dashboardpage = () => {
//   const [stats, setStats] = useState(null);
//   const [videos, setVideos] = useState([]);
//   const [pagination, setPagination] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [videosLoading, setVideosLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedVideos, setSelectedVideos] = useState(new Set());
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortType, setSortType] = useState(-1);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [analyticsData, setAnalyticsData] = useState([]);
//   const [showBulkActions, setShowBulkActions] = useState(false);

//   const getToken = () => {
//     return localStorage.getItem("token") || sessionStorage.getItem("token");
//   };
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   useEffect(() => {
//     fetchVideos(currentPage, sortBy, sortType);
//   }, [currentPage, sortBy, sortType]);

//   useEffect(() => {
//     if (stats) {
//       generateAnalyticsData();
//     }
//   }, [stats]);
//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const token = getToken();
//       if (!token) {
//         throw new Error("No Authentication token found ");
//       }
//       const response = await getChannelStats(token);
//       setStats(response.data.data);
//       console.log(response);
//     } catch (error) {
//       toast("Error fetching  dashboard stats:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const fetchVideos = async (page, sortField = "createdAt", sortOrder = -1) => {
//     try {
//       setVideosLoading(true);
//       const token = getToken();
//       if (!token) {
//         throw new Error("No authentication token found");
//         console.log(error);
//       }
//       const response = await getChannelVideo(token, {
//         page,
//         limit: 10,
//         sortBy: sortField,
//         sortType: sortOrder,
//       });

//       setVideos(response.data.data.videos);
//       console.log(response.data.data);
//       setPagination(response.data.data.pagination);
//     } catch (error) {
//       toast("Error fetching videos :", error);
//     } finally {
//       setVideosLoading(false);
//     }
//   };
//   const generateAnalyticsData = () => {
//     // Generate sample analytics data based on stats
//     const viewsData = Array.from({ length: 30 }, (_, i) => ({
//       date: new Date(
//         Date.now() - (29 - i) * 24 * 60 * 60 * 1000
//       ).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
//       views: Math.floor(Math.random() * 1000) + 100,
//       likes: Math.floor(Math.random() * 50) + 10,
//       subscribers: Math.floor(Math.random() * 20) + 5,
//     }));
//     const categoryData = [
//       { name: "Technology", value: 35, color: "#3B82F6" },
//       { name: "Education", value: 25, color: "#10B981" },
//       { name: "Entertainment", value: 20, color: "#F59E0B" },
//       { name: "Gaming", value: 15, color: "#EF4444" },
//       { name: "Other", value: 5, color: "#8B5CF6" },
//     ];
//     setAnalyticsData({ viewsData, categoryData });
//   };

//   const formatNumber = (num) => {
//     if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
//     if (num >= 1000) return (num / 1000).toFixed(1) + "K";
//     return num?.toString() || "0";
//   };

//   const formatDuration = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const handleVideoSelect = (videoId) => {
//     const newSelected = new Set(selectedVideos);
//     if (newSelected.has(videoId)) {
//       newSelected.delete(videoId);
//     } else {
//       newSelected.add(videoId);
//     }
//     setSelectedVideos(newSelected);
//     setShowBulkActions(newSelected.size > 0);
//   };

//   const handleSelectAll = () => {
//     if (selectedVideos.size === videos.length) {
//       setSelectedVideos(new Set());
//       setShowBulkActions(false);
//     } else {
//       setSelectedVideos(new Set(videos.map((v) => v._id)));
//       setShowBulkActions(true);
//     }
//   };
//   const handleBulkDelete = async () => {
//     if (
//       window.confirm(
//         `Are you sure you want to delete ${selectedVideos.size} videos?`
//       )
//     ) {
//       try {
//         // Implement bulk delete API call
//         const deletePromises = Array.from(selectedVideos).map((videoId) =>
//           deleteVideo(getToken(), videoId)
//         );
//         console.log("Deleting videos:", Array.from(selectedVideos));
//         // await bulkDeleteVideos(getToken(), Array.from(selectedVideos));
//         await Promise.all(deletePromises);
//         setSelectedVideos(new Set());
//         setShowBulkActions(false);
//         fetchVideos(currentPage, sortBy, sortType);
//       } catch (error) {
//         console.error("Error deleting videos:", error);
//       }
//     }
//   };

//   const handleBulkPublish = async () => {
//     try {
//       // Implement bulk publish API call
//       const publishPromises = Array.from(selectedVideos).map((videoId) =>
//         togglePublishStatus(getToken(), videoId)
//       );
//       console.log("Publishing videos:", Array.from(selectedVideos));
//       // await bulkPublishVideos(getToken(), Array.from(selectedVideos));
//       await Promise.all(publishPromises);
//       setSelectedVideos(new Set());
//       setShowBulkActions(false);
//       fetchVideos(currentPage, sortBy, sortType);
//     } catch (error) {
//       console.error("Error publishing videos:", error);
//     }
//   };

//   const handleBulkUnpublish = async () => {
//     try {
//       // Implement bulk unpublish API call
//       const unpublishPromises = Array.from(selectedVideos).map((videoId) =>
//         togglePublishStatus(getToken(), videoId)
//       );
//       console.log("Unpublishing videos:", Array.from(selectedVideos));
//       // await bulkUnpublishVideos(getToken(), Array.from(selectedVideos));
//       await Promise.all(unpublishPromises);
//       setSelectedVideos(new Set());
//       setShowBulkActions(false);
//       fetchVideos(currentPage, sortBy, sortType);
//     } catch (error) {
//       console.error("Error unpublishing videos:", error);
//     }
//   };

//   const handleExportData = () => {
//     const csvContent = [
//       ["Title", "Views", "Likes", "Published", "Created At"],
//       ...videos.map((video) => [
//         video.title,
//         video.views,
//         video.likesCount,
//         video.isPublished ? "Published" : "Draft",
//         formatDate(video.createdAt),
//       ]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `channel-videos-${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const filteredVideos = videos.filter(
//     (video) =>
//       video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       video.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
//     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//           <p className="text-3xl font-bold text-gray-900">
//             {formatNumber(value)}
//           </p>
//           {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
//           {trend && (
//             <div className="flex items-center mt-2">
//               <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
//               <span className="text-sm font-medium text-green-600">
//                 +{trend}%
//               </span>
//               <span className="text-sm text-gray-500 ml-1">vs last month</span>
//             </div>
//           )}
//         </div>
//         <div className={`p-3 rounded-xl ${color}`}>
//           <Icon className="w-6 h-6 text-white" />
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
//             <p className="text-gray-600">
//               Welcome back! Here's what's happening with your channel.
//             </p>
//           </div>
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={handleExportData}
//               className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               <Download className="w-4 h-4 mr-2" />
//               Export Data
//             </button>
//             <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//               <Upload className="w-4 h-4 mr-2" />
//               Upload Video
//             </button>
//           </div>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="flex border-b border-gray-200 mb-8">
//           <button
//             onClick={() => setActiveTab("overview")}
//             className={`px-6 py-3 font-medium text-sm ${
//               activeTab === "overview"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Overview
//           </button>
//           <button
//             onClick={() => setActiveTab("analytics")}
//             className={`px-6 py-3 font-medium text-sm ${
//               activeTab === "analytics"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Analytics
//           </button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatCard
//             icon={Users}
//             title="Total Subscribers"
//             value={stats?.totalSubscribers || 0}
//             color="bg-blue-500"
//             trend={12}
//           />
//           <StatCard
//             icon={Video}
//             title="Total Videos"
//             value={stats?.totalVideos || 0}
//             color="bg-green-500"
//             trend={8}
//           />
//           <StatCard
//             icon={Eye}
//             title="Total Views"
//             value={stats?.totalViews || 0}
//             color="bg-purple-500"
//             trend={25}
//           />
//           <StatCard
//             icon={ThumbsUp}
//             title="Total Likes"
//             value={stats?.totalLikes || 0}
//             color="bg-pink-500"
//             trend={15}
//           />
//         </div>

//         {activeTab === "overview" && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Videos Section */}
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//                 <div className="p-6 border-b border-gray-100">
//                   <div className="flex items-center justify-between mb-4">
//                     <h2 className="text-xl font-semibold text-gray-900">
//                       Your Videos
//                     </h2>
//                     <div className="flex items-center space-x-2">
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                         <input
//                           type="text"
//                           placeholder="Search videos..."
//                           value={searchTerm}
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                           className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                       </div>
//                       <select
//                         value={`${sortBy}-${sortType}`}
//                         onChange={(e) => {
//                           const [field, order] = e.target.value.split("-");
//                           setSortBy(field);
//                           setSortType(parseInt(order));
//                         }}
//                         className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       >
//                         <option value="createdAt--1">Newest First</option>
//                         <option value="createdAt-1">Oldest First</option>
//                         <option value="views--1">Most Views</option>
//                         <option value="views-1">Least Views</option>
//                         <option value="title-1">A-Z</option>
//                         <option value="title--1">Z-A</option>
//                       </select>
//                     </div>
//                   </div>

//                   {/* Bulk Actions */}
//                   {showBulkActions && (
//                     <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
//                       <span className="text-sm font-medium text-blue-900">
//                         {selectedVideos.size} video
//                         {selectedVideos.size !== 1 ? "s" : ""} selected
//                       </span>
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={handleBulkPublish}
//                           className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
//                         >
//                           Publish
//                         </button>
//                         <button
//                           onClick={handleBulkUnpublish}
//                           className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
//                         >
//                           Unpublish
//                         </button>
//                         <button
//                           onClick={handleBulkDelete}
//                           className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   )}

//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={handleSelectAll}
//                       className="flex items-center text-sm text-gray-600 hover:text-gray-900"
//                     >
//                       {selectedVideos.size === videos.length ? (
//                         <CheckSquare className="w-4 h-4 mr-1" />
//                       ) : (
//                         <Square className="w-4 h-4 mr-1" />
//                       )}
//                       Select All
//                     </button>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   {videosLoading ? (
//                     <div className="flex justify-center py-8">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="space-y-4">
//                         {filteredVideos.map((video) => (
//                           <div
//                             key={video._id}
//                             className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//                           >
//                             <div className="flex items-center">
//                               <button
//                                 onClick={() => handleVideoSelect(video._id)}
//                                 className="mr-3"
//                               >
//                                 {selectedVideos.has(video._id) ? (
//                                   <CheckSquare className="w-5 h-5 text-blue-600" />
//                                 ) : (
//                                   <Square className="w-5 h-5 text-gray-400" />
//                                 )}
//                               </button>
//                             </div>
//                             <div className="relative">
//                               <img
//                                 src={video.thumbnail}
//                                 alt={video.title}
//                                 className="w-24 h-14 object-cover rounded-lg"
//                               />
//                               <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
//                                 {formatDuration(video.duration)}
//                               </div>
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <h3 className="font-medium text-gray-900 truncate">
//                                 {video.title}
//                               </h3>
//                               <p className="text-sm text-gray-500 truncate">
//                                 {video.description}
//                               </p>
//                               <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
//                                 <span className="flex items-center">
//                                   <Eye className="w-4 h-4 mr-1" />
//                                   {formatNumber(video.views)}
//                                 </span>
//                                 <span className="flex items-center">
//                                   <ThumbsUp className="w-4 h-4 mr-1" />
//                                   {formatNumber(video.likesCount)}
//                                 </span>
//                                 <span className="flex items-center">
//                                   <Calendar className="w-4 h-4 mr-1" />
//                                   {formatDate(video.createdAt)}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <span
//                                 className={`px-2 py-1 text-xs rounded-full ${
//                                   video.isPublished
//                                     ? "bg-green-100 text-green-800"
//                                     : "bg-yellow-100 text-yellow-800"
//                                 }`}
//                               >
//                                 {video.isPublished ? "Published" : "Draft"}
//                               </span>
//                               <div className="flex items-center space-x-1">
//                                 <button
//                                   className="p-1 hover:bg-gray-200 rounded"
//                                   title="Edit"
//                                 >
//                                   <Edit3 className="w-4 h-4 text-gray-600" />
//                                 </button>
//                                 <button
//                                   className="p-1 hover:bg-gray-200 rounded"
//                                   title="Delete"
//                                 >
//                                   <Trash2 className="w-4 h-4 text-red-600" />
//                                 </button>
//                                 <button
//                                   className="p-1 hover:bg-gray-200 rounded"
//                                   title="More"
//                                 >
//                                   <MoreVertical className="w-4 h-4 text-gray-600" />
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>

//                       {/* Pagination */}
//                       {pagination.totalPages > 1 && (
//                         <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
//                           <div className="text-sm text-gray-600">
//                             Showing {(currentPage - 1) * 10 + 1} to{" "}
//                             {Math.min(currentPage * 10, pagination.totalVideos)}{" "}
//                             of {pagination.totalVideos} videos
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() =>
//                                 setCurrentPage((prev) => Math.max(prev - 1, 1))
//                               }
//                               disabled={currentPage === 1}
//                               className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                               <ChevronLeft className="w-4 h-4" />
//                             </button>
//                             <span className="px-3 py-2 text-sm">
//                               {currentPage} of {pagination.totalPages}
//                             </span>
//                             <button
//                               onClick={() =>
//                                 setCurrentPage((prev) =>
//                                   Math.min(prev + 1, pagination.totalPages)
//                                 )
//                               }
//                               disabled={currentPage === pagination.totalPages}
//                               className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                               <ChevronRight className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Recent Subscribers */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//               <div className="p-6 border-b border-gray-100">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   Recent Subscribers
//                 </h2>
//               </div>
//               <div className="p-6">
//                 <div className="space-y-4">
//                   {stats?.recentSubscribers?.map((sub) => (
//                     <div
//                       key={sub.subscriber._id}
//                       className="flex items-center space-x-3"
//                     >
//                       <img
//                         src={sub.subscriber.avatar}
//                         alt={sub.subscriber.fullName}
//                         className="w-10 h-10 rounded-full object-cover"
//                       />
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 truncate">
//                           {sub.subscriber.fullName}
//                         </p>
//                         <p className="text-xs text-gray-500 truncate">
//                           @{sub.subscriber.userName}
//                         </p>
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {formatDate(sub.createdAt)}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 {(!stats?.recentSubscribers ||
//                   stats.recentSubscribers.length === 0) && (
//                   <div className="text-center py-8">
//                     <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-500">No recent subscribers</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "analytics" && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Views Chart */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Views & Engagement
//                 </h3>
//                 <div className="flex items-center space-x-2">
//                   <BarChart3 className="w-5 h-5 text-gray-500" />
//                 </div>
//               </div>
//               <div className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={analyticsData.viewsData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="date" />
//                     <YAxis />
//                     <Tooltip />
//                     <Line
//                       type="monotone"
//                       dataKey="views"
//                       stroke="#3B82F6"
//                       strokeWidth={2}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="likes"
//                       stroke="#10B981"
//                       strokeWidth={2}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Subscribers Chart */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Subscriber Growth
//                 </h3>
//                 <div className="flex items-center space-x-2">
//                   <Activity className="w-5 h-5 text-gray-500" />
//                 </div>
//               </div>
//               <div className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={analyticsData.viewsData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="date" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="subscribers" fill="#8B5CF6" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Content Categories */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Content Categories
//                 </h3>
//                 <div className="flex items-center space-x-2">
//                   <PieChart className="w-5 h-5 text-gray-500" />
//                 </div>
//               </div>
//               <div className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <RechartsPieChart>
//                     <Pie
//                       data={analyticsData.categoryData}
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={80}
//                       dataKey="value"
//                     >
//                       {analyticsData.categoryData?.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </RechartsPieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="mt-4 space-y-2">
//                 {analyticsData.categoryData?.map((category, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <div
//                         className="w-3 h-3 rounded-full"
//                         style={{ backgroundColor: category.color }}
//                       ></div>
//                       <span className="text-sm text-gray-600">
//                         {category.name}
//                       </span>
//                     </div>
//                     <span className="text-sm font-medium text-gray-900">
//                       {category.value}%
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Performance Metrics */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">
//                 Performance Metrics
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">
//                       Avg. View Duration
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">4:32</p>
//                   </div>
//                   <div className="text-green-600">
//                     <TrendingUp className="w-6 h-6" />
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">
//                       Click-through Rate
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">8.5%</p>
//                   </div>
//                   <div className="text-green-600">
//                     <TrendingUp className="w-6 h-6" />
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">
//                       Engagement Rate
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">12.3%</p>
//                   </div>
//                   <div className="text-green-600">
//                     <TrendingUp className="w-6 h-6" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboardpage;

// src/components/dashboard/DashboardPage.jsx

import ChannelStats from "./Channelstat";
import VideoStats from "./VideoStats";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your channel performance</p>
        </div>
        <VideoStats />
        <ChannelStats />
      </div>
    </div>
  );
}
