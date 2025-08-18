import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  UserX,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Shield,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "../hooks/UseAuth";
import {
  getAllAdmins,
  adminDeleteAdmin,
  getAdminById,
  toggleAdminStatus,
  adminRegister,
} from "../services/api";
import { toast } from "react-toastify";

const ManageAdmins = () => {
  const { adminToken } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });

  // Delete form state
  const [deleteForm, setDeleteForm] = useState({
    reason: "",
    confirmDelete: false,
  });

  // Status toggle form state
  const [statusForm, setStatusForm] = useState({
    reason: "",
    isDeactivating: false,
  });
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        // Only search when searchTerm changes
        setCurrentPage(1); // Reset to first page when searching
        fetchAdmins();
      }
    }, 100);

    return () => clearTimeout(searchTimer);
  }, [searchTerm]);
  useEffect(() => {
    fetchAdmins();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Only add status if it's not 'all'
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await getAllAdmins(adminToken, params);

      if (response.data) {
        setAdmins(response.data.data?.admins || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to fetch admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (
      !registerForm.fullName ||
      !registerForm.email ||
      !registerForm.userName ||
      !registerForm.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const { confirmPassword, ...submitData } = registerForm;
      await adminRegister(adminToken, submitData);

      setShowRegisterModal(false);
      setRegisterForm({
        fullName: "",
        email: "",
        userName: "",
        password: "",
        confirmPassword: "",
      });

      await fetchAdmins();
      toast("Admin registered successfully!");
    } catch (error) {
      console.error("Error registering admin:", error);
      setError(error.response?.data?.message || "Failed to register admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatusClick = (admin) => {
    setSelectedAdmin(admin);
    setStatusForm({
      reason: "",
      isDeactivating: admin.isActive,
    });
    setShowStatusModal(true);
  };

  const handleToggleStatusConfirm = async () => {
    try {
      setActionLoading(true);
      setError("");

      const statusData = statusForm.isDeactivating
        ? { reason: statusForm.reason || "Administrative decision" }
        : {}; // No data needed for reactivation

      await toggleAdminStatus(adminToken, selectedAdmin._id, statusData);

      setShowStatusModal(false);
      setSelectedAdmin(null);
      setStatusForm({ reason: "", isDeactivating: false });

      await fetchAdmins();
      toast.success(
        `Admin ${
          statusForm.isDeactivating ? "deactivated" : "reactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error toggling admin status:", error);
      setError(
        error.response?.data?.message || "Failed to update admin status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteForm.confirmDelete) {
      setError("Please confirm deletion");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await adminDeleteAdmin(adminToken, selectedAdmin._id, {
        confirmDelete: deleteForm.confirmDelete,
        reason: deleteForm.reason,
      });

      setShowDeleteModal(false);
      setSelectedAdmin(null);
      setDeleteForm({ reason: "", confirmDelete: false });

      await fetchAdmins();
      toast.success("Admin deleted successfully!");
    } catch (error) {
      console.error("Error deleting admin:", error);
      setError(error.response?.data?.message || "Failed to delete admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (adminId) => {
    try {
      setDetailsLoading(true);
      setError("");
      setShowDetailsModal(true);

      const response = await getAdminById(adminToken, adminId);

      if (response.data) {
        setAdminDetails(response.data?.data?.admin);
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
      setError(
        error.response?.data?.message || "Failed to fetch admin details"
      );
      setShowDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchLoading(true);

    // Clear search loading after a delay
    setTimeout(() => setSearchLoading(false), 600);
  };
  const themeClasses = {
    container: isDarkMode
      ? "bg-gray-900 text-white"
      : "bg-gray-50 text-gray-900",
    card: isDarkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200",
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
    button: {
      primary: isDarkMode
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-blue-500 hover:bg-blue-600",
      secondary: isDarkMode
        ? "bg-gray-700 hover:bg-gray-600"
        : "bg-gray-200 hover:bg-gray-300",
      danger: isDarkMode
        ? "bg-red-600 hover:bg-red-700"
        : "bg-red-500 hover:bg-red-600",
    },
    modal: isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900",
  };

  return (
    <div className={`min-h-screen p-6 ${themeClasses.container}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">Manage Admins</h1>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage admin accounts and user permissions
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium ${themeClasses.button.primary}`}
          >
            <UserPlus className="w-4 h-4" />
            Add New Admin
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
              <button onClick={() => setError("")} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`${themeClasses.card} rounded-lg border p-4 mb-6`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              <input
                type="text"
                placeholder="Search admins by name, username, or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`w-full pl-10 pr-10 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div
          className={`${themeClasses.card} rounded-lg border overflow-hidden`}
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No admins found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    } border-b ${
                      isDarkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                  >
                    <tr>
                      <th className="text-left p-4 font-medium">
                        Admin Details
                      </th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Created</th>
                      <th className="text-center p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr
                        key={admin._id}
                        className={`border-b ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } hover:${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full ${
                                isDarkMode ? "bg-gray-600" : "bg-gray-300"
                              } flex items-center justify-center`}
                            >
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{admin.fullName}</p>
                              <p
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                @{admin.userName}
                              </p>
                              <p
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              admin.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {admin.isActive ? "Active" : "Deactivated"}
                          </span>
                          {admin.deactivatedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                admin.deactivatedAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="capitalize">{admin.role}</span>
                            {admin.isSuperAdmin && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded ml-1">
                                Super
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(admin._id)}
                              disabled={actionLoading}
                              className={`p-2 rounded-lg transition-colors ${themeClasses.button.secondary}`}
                              title="View Admin Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatusClick(admin)}
                              disabled={actionLoading}
                              className={`p-2 rounded-lg transition-colors ${
                                admin.isActive
                                  ? `${themeClasses.button.danger} text-white`
                                  : `${themeClasses.button.primary} text-white`
                              }`}
                              title={
                                admin.isActive
                                  ? "Deactivate Admin"
                                  : "Activate Admin"
                              }
                            >
                              {admin.isActive ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                            {!admin.isSuperAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setShowDeleteModal(true);
                                }}
                                disabled={actionLoading}
                                className={`p-2 rounded-lg transition-colors ${themeClasses.button.danger} text-white`}
                                title="Delete Admin"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Status Toggle Modal */}
        {showStatusModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`${themeClasses.modal} rounded-lg p-6 w-full max-w-md`}
            >
              <div className="flex items-center gap-3 mb-4">
                {statusForm.isDeactivating ? (
                  <UserX className="w-6 h-6 text-red-500" />
                ) : (
                  <UserCheck className="w-6 h-6 text-green-500" />
                )}
                <h2 className="text-xl font-bold">
                  {statusForm.isDeactivating ? "Deactivate" : "Reactivate"}{" "}
                  Admin
                </h2>
              </div>

              <div className="mb-4">
                <p className="text-sm mb-2">
                  You are about to{" "}
                  {statusForm.isDeactivating ? "deactivate" : "reactivate"} the
                  admin account for:
                </p>
                <div
                  className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className="font-medium">{selectedAdmin.fullName}</p>
                  <p className="text-sm opacity-75">
                    @{selectedAdmin.userName}
                  </p>
                  <p className="text-sm opacity-75">{selectedAdmin.email}</p>
                </div>
              </div>

              {statusForm.isDeactivating && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Reason for deactivation (optional)
                  </label>
                  <textarea
                    value={statusForm.reason}
                    onChange={(e) =>
                      setStatusForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="3"
                    placeholder="Enter reason for deactivation..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedAdmin(null);
                    setStatusForm({ reason: "", isDeactivating: false });
                    setError("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatusConfirm}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    statusForm.isDeactivating
                      ? themeClasses.button.danger
                      : themeClasses.button.primary
                  } disabled:opacity-50`}
                >
                  {actionLoading
                    ? `${
                        statusForm.isDeactivating
                          ? "Deactivating"
                          : "Reactivating"
                      }...`
                    : `${
                        statusForm.isDeactivating ? "Deactivate" : "Reactivate"
                      } Admin`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`${themeClasses.modal} rounded-lg p-6 w-full max-w-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Admin Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setAdminDetails(null);
                    setError("");
                  }}
                  className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading admin details...</p>
                </div>
              ) : adminDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-full ${
                        isDarkMode ? "bg-gray-600" : "bg-gray-300"
                      } flex items-center justify-center`}
                    >
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {adminDetails.fullName}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        @{adminDetails.userName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-sm break-all">{adminDetails.email}</p>
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Role</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm capitalize">
                          {adminDetails.role}
                        </span>
                        {adminDetails.isSuperAdmin && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded ml-1">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          adminDetails.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {adminDetails.isActive ? "Active" : "Deactivated"}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Created</span>
                      </div>
                      <p className="text-sm">
                        {new Date(adminDetails.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div
                    className={`p-4 rounded-lg border ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Admin ID:</span>
                        <span className="font-mono text-xs">
                          {adminDetails._id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Type:</span>
                        <span>
                          {adminDetails.isSuperAdmin
                            ? "Super Admin"
                            : "Regular Admin"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>
                          {adminDetails.updatedAt
                            ? new Date(
                                adminDetails.updatedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      {adminDetails.deactivatedAt && (
                        <>
                          <div className="flex justify-between">
                            <span>Deactivated:</span>
                            <span>
                              {new Date(
                                adminDetails.deactivatedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {adminDetails.deactivationReason && (
                            <div className="flex flex-col">
                              <span className="font-medium">Reason:</span>
                              <span className="text-xs italic">
                                {adminDetails.deactivationReason}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setAdminDetails(null);
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setAdminDetails(null);
                        handleToggleStatusClick(adminDetails);
                      }}
                      disabled={actionLoading}
                      className={`flex-1 px-4 py-2 rounded-lg text-white ${
                        adminDetails.isActive
                          ? themeClasses.button.danger
                          : themeClasses.button.primary
                      }`}
                    >
                      {adminDetails.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-500">Failed to load admin details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Register Admin Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`${themeClasses.modal} rounded-lg p-6 w-full max-w-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Register New Admin</h2>
                <button
                  onClick={() => {
                    setShowRegisterModal(false);
                    setError("");
                  }}
                  className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.fullName}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.userName}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        userName: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterModal(false);
                      setError("");
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`flex-1 px-4 py-2 rounded-lg text-white ${themeClasses.button.primary} disabled:opacity-50`}
                  >
                    {actionLoading ? "Registering..." : "Register Admin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`${themeClasses.modal} rounded-lg p-6 w-full max-w-md`}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold">Delete Admin Account</h2>{" "}
                {/* Updated title */}
              </div>
              <div className="mb-4">
                <p className="text-sm mb-2">
                  You are about to permanently delete the admin account for:{" "}
                  {/* Updated text */}
                </p>
                <div
                  className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <p className="font-medium">{selectedAdmin.fullName}</p>
                  <p className="text-sm opacity-75">
                    @{selectedAdmin.userName}
                  </p>
                  <p className="text-sm opacity-75">{selectedAdmin.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason for deletion (optional)
                  </label>
                  <textarea
                    value={deleteForm.reason}
                    onChange={(e) =>
                      setDeleteForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="3"
                    placeholder="Enter reason for admin account deletion..." // Updated placeholder
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirmDelete"
                    checked={deleteForm.confirmDelete}
                    onChange={(e) =>
                      setDeleteForm((prev) => ({
                        ...prev,
                        confirmDelete: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="confirmDelete" className="text-sm">
                    I understand this action cannot be undone
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedAdmin(null);
                      setDeleteForm({ reason: "", confirmDelete: false });
                      setError("");
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAdmin} // Updated function call
                    disabled={actionLoading || !deleteForm.confirmDelete}
                    className={`flex-1 px-4 py-2 rounded-lg text-white ${themeClasses.button.danger} disabled:opacity-50`}
                  >
                    {actionLoading ? "Deleting..." : "Delete Admin"}{" "}
                    {/* Updated text */}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAdmins;
