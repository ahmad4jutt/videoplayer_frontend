import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { updateAccountDetails, changePassword } from "../../services/api";

const Settingpage = () => {
  const { token, currentUser, setUser } = useAuth();

  const [account, setAccount] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState({ account: false, password: false });
  const [activeSection, setActiveSection] = useState("account");

  useEffect(() => {
    if (currentUser) {
      setAccount({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleAccount = async () => {
    clearMessages();
    setLoading({ ...loading, account: true });

    try {
      const response = await updateAccountDetails(token, account);
      setUser(response.data);
      setSuccess("Account updated successfully");
    } catch (err) {
      setError("Failed to update account");
    } finally {
      setLoading({ ...loading, account: false });
    }
  };

  const handlePassword = async () => {
    clearMessages();
    setLoading({ ...loading, password: true });

    try {
      await changePassword(token, password);
      setSuccess("Password changed successfully");
      setPassword({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  const menuItems = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "security", label: "Security", icon: "🛡️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "data", label: "Data and privacy", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-normal text-gray-900">Settings</h1>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700"
                }`}
              >
                <span className="mr-4 text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          <div className="p-6">
            {/* Alert Messages */}
            {(error || success) && (
              <div className="mb-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-sm">
                    {success}
                  </div>
                )}
              </div>
            )}

            {/* Account Section */}
            {activeSection === "account" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    Account
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Manage your account settings and personal information
                  </p>
                </div>

                {/* Profile Picture */}
                <div className="bg-white rounded border border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-medium">
                        {currentUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {currentUser.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-white rounded border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Personal info
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={account.name}
                        onChange={(e) =>
                          setAccount({ ...account, name: e.target.value })
                        }
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={account.email}
                        onChange={(e) =>
                          setAccount({ ...account, email: e.target.value })
                        }
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleAccount}
                      disabled={loading.account}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.account ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    Security
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Manage your account security settings
                  </p>
                </div>

                <div className="bg-white rounded border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Change password
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current password
                      </label>
                      <input
                        type="password"
                        value={password.currentPassword}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New password
                      </label>
                      <input
                        type="password"
                        value={password.newPassword}
                        onChange={(e) =>
                          setPassword({
                            ...password,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handlePassword}
                      disabled={loading.password}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.password ? "Changing..." : "Change password"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Sections */}
            {(activeSection === "privacy" ||
              activeSection === "notifications" ||
              activeSection === "data") && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    {menuItems.find((item) => item.id === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    {activeSection === "privacy" &&
                      "Control who can see your information and activity"}
                    {activeSection === "notifications" &&
                      "Choose what notifications you want to receive"}
                    {activeSection === "data" &&
                      "Manage your data and privacy settings"}
                  </p>
                </div>

                <div className="bg-white rounded border border-gray-200 p-6">
                  <p className="text-gray-600 text-sm">
                    {activeSection === "privacy" &&
                      "Privacy settings will be available here."}
                    {activeSection === "notifications" &&
                      "Notification preferences will be available here."}
                    {activeSection === "data" &&
                      "Data management options will be available here."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settingpage;
