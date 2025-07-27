import React, { useState } from "react";
import {
  Settings,
  Users,
  Shield,
  Database,
  Bell,
  Mail,
  Globe,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from "lucide-react";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: "My Application",
      siteDescription: "A powerful web application",
      adminEmail: "admin@example.com",
      timezone: "UTC",
      language: "en",
    },
    security: {
      twoFactorAuth: true,
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requirePasswordChange: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      systemAlerts: true,
      userRegistrations: true,
      criticalErrors: true,
    },
    database: {
      autoBackup: true,
      backupFrequency: "daily",
      retentionDays: 30,
      compressionEnabled: true,
    },
    api: {
      apiKey: "sk-1234567890abcdef...",
      rateLimitPerMinute: 100,
      enableCors: true,
      logRequests: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "database", label: "Database", icon: Database },
    { id: "api", label: "API", icon: Key },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) =>
            handleSettingChange("general", "siteName", e.target.value)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) =>
            handleSettingChange("general", "siteDescription", e.target.value)
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) =>
              handleSettingChange("general", "adminEmail", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) =>
              handleSettingChange("general", "timezone", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-600">
            Add an extra layer of security to admin accounts
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.security.twoFactorAuth}
            onChange={(e) =>
              handleSettingChange("security", "twoFactorAuth", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Password Length
          </label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "passwordMinLength",
                parseInt(e.target.value)
              )
            }
            min="6"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "sessionTimeout",
                parseInt(e.target.value)
              )
            }
            min="5"
            max="480"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Login Attempts
        </label>
        <input
          type="number"
          value={settings.security.maxLoginAttempts}
          onChange={(e) =>
            handleSettingChange(
              "security",
              "maxLoginAttempts",
              parseInt(e.target.value)
            )
          }
          min="3"
          max="10"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries({
        emailNotifications: "Email Notifications",
        pushNotifications: "Push Notifications",
        systemAlerts: "System Alerts",
        userRegistrations: "User Registration Alerts",
        criticalErrors: "Critical Error Alerts",
      }).map(([key, label]) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <h3 className="font-medium text-gray-900">{label}</h3>
            <p className="text-sm text-gray-600">
              {key === "emailNotifications" &&
                "Receive notifications via email"}
              {key === "pushNotifications" &&
                "Receive browser push notifications"}
              {key === "systemAlerts" &&
                "Get alerted about system status changes"}
              {key === "userRegistrations" &&
                "Get notified when new users register"}
              {key === "criticalErrors" &&
                "Immediate alerts for critical system errors"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications[key]}
              onChange={(e) =>
                handleSettingChange("notifications", key, e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Auto Backup</h3>
          <p className="text-sm text-gray-600">
            Automatically backup database at scheduled intervals
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.database.autoBackup}
            onChange={(e) =>
              handleSettingChange("database", "autoBackup", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <select
            value={settings.database.backupFrequency}
            onChange={(e) =>
              handleSettingChange("database", "backupFrequency", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retention Period (days)
          </label>
          <input
            type="number"
            value={settings.database.retentionDays}
            onChange={(e) =>
              handleSettingChange(
                "database",
                "retentionDays",
                parseInt(e.target.value)
              )
            }
            min="1"
            max="365"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Database className="w-4 h-4" />
          <span>Create Backup Now</span>
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>View Backups</span>
        </button>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.api.apiKey}
              readOnly
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Regenerate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Limit (requests/minute)
          </label>
          <input
            type="number"
            value={settings.api.rateLimitPerMinute}
            onChange={(e) =>
              handleSettingChange(
                "api",
                "rateLimitPerMinute",
                parseInt(e.target.value)
              )
            }
            min="10"
            max="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Enable CORS</h3>
            <p className="text-sm text-gray-600">
              Allow cross-origin requests to the API
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.api.enableCors}
              onChange={(e) =>
                handleSettingChange("api", "enableCors", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Log API Requests</h3>
            <p className="text-sm text-gray-600">
              Keep detailed logs of all API requests
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.api.logRequests}
              onChange={(e) =>
                handleSettingChange("api", "logRequests", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      case "database":
        return renderDatabaseSettings();
      case "api":
        return renderApiSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Settings
          </h1>
          <p className="text-gray-600">
            Manage your application settings and configurations
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-8">{renderContent()}</div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
