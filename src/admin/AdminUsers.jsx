import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  UserX,
  UserCheck,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Activity,
  UserMinus,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  getAllUsers,
  searchUsers,
  getUserById,
  forceDeactivateUser,
  adminReactivateUser,
  adminDeleteUser,
} from "../services/api";
import { useAuth } from "../hooks/UseAuth";
import { useTheme } from "../context/ThemeContext";

const AdminUsers = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Action modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const [deletionReason, setDeletionReason] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionUser, setActionUser] = useState(null);

  const { adminToken, currentAdmin } = useAuth();

  // Check if current user is super admin (you may need to adjust this based on your auth structure)
  const isSuperAdmin =
    currentAdmin?.role === "superadmin" ||
    currentAdmin?.data?.role.superadmin ||
    currentAdmin?.data?.admin?.isSuperAdmin;

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      };

      const response = await getAllUsers(adminToken, params);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Add toast notification here
    } finally {
      setLoading(false);
    }
  };

  // Search users function
  const handleSearchUsers = async (query) => {
    if (!query.trim()) {
      // If search is empty, fetch all users
      fetchUsers();
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsers(adminToken, query);
      setUsers(response.data.data || response.data);
      // Reset pagination for search results
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalUsers: response.data.data?.length || response.data?.length || 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
      setPagination({});
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      // Debounce search
      const timer = setTimeout(() => {
        handleSearchUsers(searchTerm);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchUsers();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchUsers();
    }
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleUserAction = async (action, userId) => {
    setShowDropdown(null);
    const user = users.find((u) => u._id === userId);
    setActionUser(user);

    if (action === "view") {
      await handleViewUserDetails(userId);
    } else if (action === "deactivate") {
      setShowDeactivateModal(true);
    } else if (action === "activate") {
      await handleActivateUser(userId);
    } else if (action === "delete") {
      setShowDeleteModal(true);
    }
  };

  const handleViewUserDetails = async (userId) => {
    setLoadingUserDetails(true);
    try {
      const response = await getUserById(adminToken, userId);
      setSelectedUser(response.data.data || response.data);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Add toast notification here
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!deactivationReason.trim()) {
      alert("Please provide a reason for deactivation");
      return;
    }

    setActionLoading(true);
    try {
      await forceDeactivateUser(adminToken, actionUser._id, {
        reason: deactivationReason,
      });

      // Update user in the list
      setUsers(
        users.map((user) =>
          user._id === actionUser._id
            ? { ...user, isActive: false, deactivationReason }
            : user
        )
      );

      setShowDeactivateModal(false);
      setDeactivationReason("");
      setActionUser(null);

      // Add success toast notification here
      console.log("User deactivated successfully");
    } catch (error) {
      console.error("Error deactivating user:", error);
      // Add error toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    setActionLoading(true);
    try {
      await adminReactivateUser(adminToken, userId);

      // Update user in the list
      setUsers(
        users.map((user) =>
          user._id === userId
            ? { ...user, isActive: true, deactivationReason: null }
            : user
        )
      );

      // Add success toast notification here
      console.log("User activated successfully");
    } catch (error) {
      console.error("Error activating user:", error);
      // Add error toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (confirmDelete !== actionUser?.userName) {
      alert(`Please type "${actionUser?.userName}" to confirm deletion`);
      return;
    }

    setActionLoading(true);
    try {
      await adminDeleteUser(adminToken, actionUser._id, {
        confirmDelete: true,
        reason: deletionReason,
      });

      // Remove user from the list
      setUsers(users.filter((user) => user._id !== actionUser._id));

      setShowDeleteModal(false);
      setDeletionReason("");
      setConfirmDelete("");
      setActionUser(null);

      // Add success toast notification here
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      // Add error toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
    setDeactivationReason("");
    setActionUser(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletionReason("");
    setConfirmDelete("");
    setActionUser(null);
  };

  const getStatusBadge = (isActive, deactivationReason) => {
    if (isActive) {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isDarkMode
              ? "bg-green-900/20 text-green-400 border border-green-800"
              : "bg-green-100 text-green-800 border border-green-200"
          }`}
        >
          <Activity className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isDarkMode
              ? "bg-red-900/20 text-red-400 border border-red-800"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          <UserMinus className="w-3 h-3 mr-1" />
          Deactivated
        </span>
      );
    }
  };

  const isLoading = loading || isSearching;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b`}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Manage and monitor user accounts
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={searchTerm}
              onChange={handleSearch}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter
              className={`w-4 h-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Users
                </p>
                <p className="text-2xl font-bold">
                  {pagination.totalUsers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {users.filter((user) => user.isActive).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Deactivated
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {users.filter((user) => !user.isActive).length}
                </p>
              </div>
              <UserMinus className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div
          className={`rounded-xl border overflow-hidden ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* Users Table */}
                <div
                  className={`rounded-xl border overflow-hidden ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead
                            className={`${
                              isDarkMode ? "bg-gray-700" : "bg-gray-50"
                            }`}
                          >
                            <tr>
                              <th
                                className={`w-80 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  isDarkMode ? "text-gray-300" : "text-gray-500"
                                }`}
                              >
                                User
                              </th>
                              <th
                                className={`w-40 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  isDarkMode ? "text-gray-300" : "text-gray-500"
                                }`}
                              >
                                Status
                              </th>
                              <th
                                className={`w-48 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-80 ${
                                  isDarkMode
                                    ? "text-gray-300 hover:bg-gray-600"
                                    : "text-gray-500 hover:bg-gray-100"
                                }`}
                                onClick={() => handleSort("createdAt")}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>Joined</span>
                                  <Calendar className="w-3 h-3" />
                                </div>
                              </th>
                              <th
                                className={`w-32 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                  isDarkMode ? "text-gray-300" : "text-gray-500"
                                }`}
                              >
                                Watch History
                              </th>
                              <th
                                className={`w-24 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                                  isDarkMode ? "text-gray-300" : "text-gray-500"
                                }`}
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody
                            className={`divide-y ${
                              isDarkMode ? "divide-gray-700" : "divide-gray-200"
                            }`}
                          >
                            {users.length > 0 ? (
                              users.map((user) => (
                                <tr
                                  key={user._id}
                                  className={`hover:${
                                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                                  } transition-colors`}
                                >
                                  <td className="w-80 px-6 py-4">
                                    <div className="flex items-center min-w-0">
                                      <div className="flex-shrink-0">
                                        <img
                                          className="h-10 w-10 rounded-full object-cover"
                                          src={user.avatar}
                                          alt={user.fullName}
                                          onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                              user.fullName
                                            )}&background=random`;
                                          }}
                                        />
                                      </div>
                                      <div className="ml-4 min-w-0 flex-1">
                                        <div className="text-sm font-medium truncate">
                                          {user.fullName}
                                        </div>
                                        <div
                                          className={`text-sm truncate ${
                                            isDarkMode
                                              ? "text-gray-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          @{user.userName}
                                        </div>
                                        <div
                                          className={`text-xs truncate ${
                                            isDarkMode
                                              ? "text-gray-500"
                                              : "text-gray-400"
                                          } flex items-center mt-1`}
                                        >
                                          <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                          <span className="truncate">
                                            {user.email}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="w-40 px-6 py-4">
                                    <div className="space-y-1">
                                      {getStatusBadge(
                                        user.isActive,
                                        user.deactivationReason
                                      )}
                                      {user.deactivationReason && (
                                        <div
                                          className={`text-xs truncate ${
                                            isDarkMode
                                              ? "text-gray-400"
                                              : "text-gray-500"
                                          }`}
                                          title={user.deactivationReason}
                                        >
                                          {user.deactivationReason}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="w-48 px-6 py-4">
                                    <div className="text-sm">
                                      {formatDate(user.createdAt)}
                                    </div>
                                    <div
                                      className={`text-xs truncate ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Last updated: {formatDate(user.updatedAt)}
                                    </div>
                                  </td>
                                  <td className="w-32 px-6 py-4">
                                    <div className="text-sm font-medium">
                                      {user.watchHistory?.length || 0} videos
                                    </div>
                                  </td>
                                  <td className="w-24 px-6 py-4 text-right">
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setShowDropdown(
                                            showDropdown === user._id
                                              ? null
                                              : user._id
                                          )
                                        }
                                        disabled={actionLoading}
                                        className={`p-2 rounded-lg transition-colors ${
                                          isDarkMode
                                            ? "hover:bg-gray-700 text-gray-400"
                                            : "hover:bg-gray-100 text-gray-600"
                                        } ${
                                          actionLoading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }`}
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {showDropdown === user._id && (
                                        <div
                                          className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-10 ${
                                            isDarkMode
                                              ? "bg-gray-800 border-gray-700"
                                              : "bg-white border-gray-200"
                                          }`}
                                        >
                                          <div className="py-1">
                                            <button
                                              onClick={() =>
                                                handleUserAction(
                                                  "view",
                                                  user._id
                                                )
                                              }
                                              disabled={loadingUserDetails}
                                              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
                                                isDarkMode
                                                  ? "hover:bg-gray-700 text-gray-300"
                                                  : "hover:bg-gray-100 text-gray-700"
                                              } ${
                                                loadingUserDetails
                                                  ? "opacity-50 cursor-not-allowed"
                                                  : ""
                                              }`}
                                            >
                                              <Eye className="w-4 h-4 mr-2" />
                                              {loadingUserDetails
                                                ? "Loading..."
                                                : "View Details"}
                                            </button>
                                            {user.isActive ? (
                                              <button
                                                onClick={() =>
                                                  handleUserAction(
                                                    "deactivate",
                                                    user._id
                                                  )
                                                }
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
                                                  isDarkMode
                                                    ? "hover:bg-gray-700 text-red-400"
                                                    : "hover:bg-gray-100 text-red-600"
                                                }`}
                                              >
                                                <UserX className="w-4 h-4 mr-2" />
                                                Deactivate
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() =>
                                                  handleUserAction(
                                                    "activate",
                                                    user._id
                                                  )
                                                }
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
                                                  isDarkMode
                                                    ? "hover:bg-gray-700 text-green-400"
                                                    : "hover:bg-gray-100 text-green-600"
                                                }`}
                                              >
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Activate
                                              </button>
                                            )}

                                            {/* Delete option - only for super admin */}
                                            {isSuperAdmin && (
                                              <button
                                                onClick={() =>
                                                  handleUserAction(
                                                    "delete",
                                                    user._id
                                                  )
                                                }
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
                                                  isDarkMode
                                                    ? "hover:bg-gray-700 text-red-400 border-t border-gray-700"
                                                    : "hover:bg-gray-100 text-red-600 border-t border-gray-200"
                                                }`}
                                              >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete User
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="px-6 py-12 text-center"
                                >
                                  <div
                                    className={`text-sm ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {searchTerm
                                      ? "No users found matching your search."
                                      : "No users found."}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {pagination.totalPages > 1 && !searchTerm && (
                        <div
                          className={`px-6 py-4 border-t ${
                            isDarkMode ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                              {Math.min(
                                pagination.currentPage * 10,
                                pagination.totalUsers
                              )}{" "}
                              of {pagination.totalUsers} users
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1)
                                  )
                                }
                                disabled={!pagination.hasPrevPage}
                                className={`p-2 rounded-lg transition-colors ${
                                  pagination.hasPrevPage
                                    ? isDarkMode
                                      ? "hover:bg-gray-700 text-gray-300"
                                      : "hover:bg-gray-100 text-gray-700"
                                    : isDarkMode
                                    ? "text-gray-600 cursor-not-allowed"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              <span
                                className={`px-3 py-1 rounded-lg text-sm ${
                                  isDarkMode
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {pagination.currentPage} of{" "}
                                {pagination.totalPages}
                              </span>

                              <button
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, pagination.totalPages)
                                  )
                                }
                                disabled={!pagination.hasNextPage}
                                className={`p-2 rounded-lg transition-colors ${
                                  pagination.hasNextPage
                                    ? isDarkMode
                                      ? "hover:bg-gray-700 text-gray-300"
                                      : "hover:bg-gray-100 text-gray-700"
                                    : isDarkMode
                                    ? "text-gray-600 cursor-not-allowed"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && !searchTerm && (
                <div
                  className={`px-6 py-4 border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                      {Math.min(
                        pagination.currentPage * 10,
                        pagination.totalUsers
                      )}{" "}
                      of {pagination.totalUsers} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={!pagination.hasPrevPage}
                        className={`p-2 rounded-lg transition-colors ${
                          pagination.hasPrevPage
                            ? isDarkMode
                              ? "hover:bg-gray-700 text-gray-300"
                              : "hover:bg-gray-100 text-gray-700"
                            : isDarkMode
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span
                        className={`px-3 py-1 rounded-lg text-sm ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pagination.currentPage} of {pagination.totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, pagination.totalPages)
                          )
                        }
                        disabled={!pagination.hasNextPage}
                        className={`p-2 rounded-lg transition-colors ${
                          pagination.hasNextPage
                            ? isDarkMode
                              ? "hover:bg-gray-700 text-gray-300"
                              : "hover:bg-gray-100 text-gray-700"
                            : isDarkMode
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">User Details</h2>
                <button
                  onClick={closeUserModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 mb-6">
                <img
                  className="h-20 w-20 rounded-full object-cover border-2 border-blue-500"
                  src={selectedUser.avatar}
                  alt={selectedUser.fullName}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedUser.fullName
                    )}&background=random&size=80`;
                  }}
                />
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedUser.fullName}
                  </h3>
                  <p
                    className={`text-lg ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    @{selectedUser.userName}
                  </p>
                  <div className="flex items-center mt-2">
                    {getStatusBadge(
                      selectedUser.isActive,
                      selectedUser.deactivationReason
                    )}
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Email:
                      </span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Account Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Joined:
                      </span>
                      <p className="font-medium">
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Last Updated:
                      </span>
                      <p className="font-medium">
                        {formatDate(selectedUser.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Activity Stats
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Watch History:
                      </span>
                      <p className="font-medium">
                        {selectedUser.watchHistory?.length || 0} videos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                {!selectedUser.isActive && selectedUser.deactivationReason && (
                  <div
                    className={`p-4 rounded-lg ${
                      isDarkMode ? "bg-red-900/20" : "bg-red-50"
                    }`}
                  >
                    <h4 className="font-semibold mb-3 flex items-center text-red-500">
                      <UserMinus className="w-4 h-4 mr-2" />
                      Deactivation Details
                    </h4>
                    <div>
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Reason:
                      </span>
                      <p className="font-medium text-red-500">
                        {selectedUser.deactivationReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              {selectedUser.coverImage && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Cover Image</h4>
                  <img
                    src={selectedUser.coverImage}
                    alt="Cover"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-4 border-t flex justify-end space-x-3 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={closeUserModal}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Close
              </button>
              {selectedUser.isActive ? (
                <button
                  onClick={() => {
                    handleUserAction("deactivate", selectedUser._id);
                    closeUserModal();
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Deactivate User
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleUserAction("activate", selectedUser._id);
                    closeUserModal();
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Activate User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Modal */}
      {showDeactivateModal && actionUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl shadow-2xl max-w-md w-full ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold">Deactivate User</h2>
                </div>
                <button
                  onClick={closeDeactivateModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You are about to deactivate:
                </p>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={actionUser.avatar}
                    alt={actionUser.fullName}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        actionUser.fullName
                      )}&background=random`;
                    }}
                  />
                  <div>
                    <p className="font-medium">{actionUser.fullName}</p>
                    <p className="text-sm text-gray-500">
                      @{actionUser.userName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Reason for deactivation{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  placeholder="Please provide a reason for deactivating this user..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-red-900/20" : "bg-red-50"
                }`}
              >
                <p className="text-sm text-red-600">
                  <strong>Warning:</strong> Deactivating this user will:
                </p>
                <ul className="text-sm text-red-600 mt-2 ml-4 list-disc">
                  <li>Prevent them from logging in</li>
                  <li>Send them a notification email</li>
                  <li>Clear their active sessions</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-4 border-t flex justify-end space-x-3 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={closeDeactivateModal}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateUser}
                disabled={actionLoading || !deactivationReason.trim()}
                className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center ${
                  actionLoading || !deactivationReason.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {actionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                )}
                {actionLoading ? "Deactivating..." : "Deactivate User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal (Super Admin Only) */}
      {showDeleteModal && actionUser && isSuperAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-md my-8 ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-red-600">
                    Delete User Permanently
                  </h2>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Made scrollable */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You are about to permanently delete:
                </p>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={actionUser.avatar}
                    alt={actionUser.fullName}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        actionUser.fullName
                      )}&background=random`;
                    }}
                  />
                  <div>
                    <p className="font-medium">{actionUser.fullName}</p>
                    <p className="text-sm text-gray-500">
                      @{actionUser.userName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Reason for deletion (optional)
                </label>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Provide a reason for this deletion..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Type the username to confirm deletion{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder={`Type "${actionUser.userName}" to confirm`}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-red-900/20" : "bg-red-50"
                }`}
              >
                <p className="text-sm text-red-600">
                  <strong>⚠️ DANGER:</strong> This action cannot be undone.
                  Deleting this user will:
                </p>
                <ul className="text-sm text-red-600 mt-2 ml-4 list-disc">
                  <li>Permanently delete all user data</li>
                  <li>Remove all their videos and comments</li>
                  <li>Delete all subscriptions and likes</li>
                  <li>Send them a notification email</li>
                  <li>Make their username available for others</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div
              className={`px-6 py-4 border-t flex justify-end space-x-3 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={closeDeleteModal}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={
                  actionLoading || confirmDelete !== actionUser?.userName
                }
                className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center ${
                  actionLoading || confirmDelete !== actionUser?.userName
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {actionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                )}
                {actionLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
