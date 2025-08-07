import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Code,
  Wrench,
  Link,
  Save,
  RotateCcw,
  RefreshCw,
  Mail,
  Download,
  History,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  updateSpecificSetting,
  resetSettings,
  regenerateApiKey,
  createManualBackup,
  getBackupHistory,
  testEmailNotification,
} from "../services/api";
import { useAuth } from "../hooks/UseAuth";

const AdminSettings = () => {
  const { adminToken } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    integrations: {
      googleAnalytics: {
        enabled: false,
        trackingId: "",
      },
      cloudStorage: {
        provider: "local",
        bucket: "",
        region: "",
      },
      socialLogin: {
        google: {
          enabled: false,
          clientId: "",
        },
        facebook: {
          enabled: false,
          appId: "",
        },
      },
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [notification, setNotification] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [backupHistory, setBackupHistory] = useState([]);

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "database", label: "Database", icon: Database },
    { id: "api", label: "API", icon: Code },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "integrations", label: "Integrations", icon: Link },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSettings(adminToken);
      setSettings(response.data.data);
    } catch (error) {
      showNotification("Failed to fetch settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchBackupHistory = async () => {
    try {
      const response = await getBackupHistory(adminToken);
      setBackupHistory(response.data.data.backups);
    } catch (error) {
      showNotification("Failed to fetch backup history", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const saveSettings = async (category) => {
    setSaving(true);
    try {
      const response = await updateSettings(adminToken, {
        category,
        settings: settings[category],
      });

      if (response.data.success) {
        setSettings(response.data.data);
        showNotification(`${category} settings saved successfully`);
      } else {
        showNotification(
          response.data.message || "Failed to save settings",
          "error"
        );
      }
    } catch (error) {
      showNotification("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async (category) => {
    if (
      !confirm(
        `Are you sure you want to reset ${category} settings to default?`
      )
    )
      return;

    setSaving(true);
    try {
      const response = await resetSettings(adminToken);

      if (response.data.success) {
        setSettings(response.data.data);
        showNotification(`${category} settings reset to default`);
      } else {
        showNotification(
          response.data.message || "Failed to reset settings",
          "error"
        );
      }
    } catch (error) {
      showNotification("Failed to reset settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const regenerateApiKey = async () => {
    if (
      !confirm(
        "Are you sure you want to regenerate the API key? This will invalidate the current key."
      )
    )
      return;

    setRegeneratingKey(true);
    try {
      const response = await regenerateApiKey(adminToken);

      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          api: {
            ...prev.api,
            apiKey: response.data.data.apiKey,
          },
        }));
        showNotification("API key regenerated successfully");
      } else {
        showNotification(
          response.data.message || "Failed to regenerate API key",
          "error"
        );
      }
    } catch (error) {
      showNotification("Failed to regenerate API key", "error");
    } finally {
      setRegeneratingKey(false);
    }
  };

  const createBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await createManualBackup(adminToken);

      if (response.data.success) {
        showNotification("Backup created successfully");
        fetchBackupHistory();
      } else {
        showNotification(
          response.data.message || "Failed to create backup",
          "error"
        );
      }
    } catch (error) {
      showNotification("Failed to create backup", "error");
    } finally {
      setBackupLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      showNotification("Please enter an email address", "error");
      return;
    }

    setTestEmailLoading(true);
    try {
      const response = await testEmailNotification(adminToken, {
        email: testEmail,
      });

      if (response.data.success) {
        showNotification("Test email sent successfully");
        setTestEmail("");
      } else {
        showNotification(
          response.data.message || "Failed to send test email",
          "error"
        );
      }
    } catch (error) {
      showNotification("Failed to send test email", "error");
    } finally {
      setTestEmailLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) =>
              handleSettingChange("general", "siteName", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            maxLength={100}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Admin Email
          </label>
          <input
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) =>
              handleSettingChange("general", "adminEmail", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) =>
              handleSettingChange("general", "timezone", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
            <option value="Asia/Karachi">Asia/Karachi</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="Australia/Sydney">Australia/Sydney</option>
          </select>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Language
          </label>
          <select
            value={settings.general.language}
            onChange={(e) =>
              handleSettingChange("general", "language", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Site Description
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) =>
            handleSettingChange("general", "siteDescription", e.target.value)
          }
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          maxLength={500}
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Password Minimum Length
          </label>
          <input
            type="number"
            min={6}
            max={20}
            value={settings.security.passwordMinLength}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "passwordMinLength",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min={5}
            max={480}
            value={settings.security.sessionTimeout}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "sessionTimeout",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Max Login Attempts
          </label>
          <input
            type="number"
            min={3}
            max={10}
            value={settings.security.maxLoginAttempts}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "maxLoginAttempts",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Password Expiry (days)
          </label>
          <input
            type="number"
            min={30}
            max={365}
            value={settings.security.passwordExpiry || 90}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "passwordExpiry",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="twoFactorAuth"
            checked={settings.security.twoFactorAuth}
            onChange={(e) =>
              handleSettingChange("security", "twoFactorAuth", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="twoFactorAuth"
            className={`ml-2 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Enable Two-Factor Authentication
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="requirePasswordChange"
            checked={settings.security.requirePasswordChange}
            onChange={(e) =>
              handleSettingChange(
                "security",
                "requirePasswordChange",
                e.target.checked
              )
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="requirePasswordChange"
            className={`ml-2 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Require Password Change on First Login
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={value}
              onChange={(e) =>
                handleSettingChange("notifications", key, e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor={key}
              className={`ml-2 text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
          </div>
        ))}
      </div>

      <div
        className={`border-t ${
          isDarkMode ? "border-gray-600" : "border-gray-200"
        } pt-6`}
      >
        <h4
          className={`text-lg font-medium mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Test Email Notification
        </h4>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="Enter email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
          <button
            onClick={sendTestEmail}
            disabled={testEmailLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {testEmailLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send Test
          </button>
        </div>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Backup Frequency
          </label>
          <select
            value={settings.database.backupFrequency}
            onChange={(e) =>
              handleSettingChange("database", "backupFrequency", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Retention Days
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={settings.database.retentionDays}
            onChange={(e) =>
              handleSettingChange(
                "database",
                "retentionDays",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Backup Location
          </label>
          <select
            value={settings.database.backupLocation || "local"}
            onChange={(e) =>
              handleSettingChange("database", "backupLocation", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="local">Local</option>
            <option value="cloud">Cloud</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoBackup"
            checked={settings.database.autoBackup}
            onChange={(e) =>
              handleSettingChange("database", "autoBackup", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="autoBackup"
            className={`ml-2 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Enable Automatic Backup
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="compressionEnabled"
            checked={settings.database.compressionEnabled}
            onChange={(e) =>
              handleSettingChange(
                "database",
                "compressionEnabled",
                e.target.checked
              )
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="compressionEnabled"
            className={`ml-2 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Enable Compression
          </label>
        </div>
      </div>

      <div
        className={`border-t ${
          isDarkMode ? "border-gray-600" : "border-gray-200"
        } pt-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4
            className={`text-lg font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Manual Backup
          </h4>
          <div className="flex gap-3">
            <button
              onClick={createBackup}
              disabled={backupLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {backupLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Create Backup
            </button>
            <button
              onClick={fetchBackupHistory}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              View History
            </button>
          </div>
        </div>

        {settings.database.lastBackup && (
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Last backup:{" "}
            {new Date(settings.database.lastBackup).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Rate Limit (per minute)
          </label>
          <input
            type="number"
            min={10}
            max={1000}
            value={settings.api.rateLimitPerMinute}
            onChange={(e) =>
              handleSettingChange(
                "api",
                "rateLimitPerMinute",
                parseInt(e.target.value)
              )
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Webhook URL
          </label>
          <input
            type="url"
            value={settings.api.webhookUrl || ""}
            onChange={(e) =>
              handleSettingChange("api", "webhookUrl", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="https://example.com/webhook"
          />
        </div>
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          API Key
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.api.apiKey}
              readOnly
              className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-900"
              }`}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className={`absolute right-3 top-2.5 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={regenerateApiKey}
            disabled={regeneratingKey}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {regeneratingKey ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regenerate
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableCors"
            checked={settings.api.enableCors}
            onChange={(e) =>
              handleSettingChange("api", "enableCors", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="enableCors"
            className={`ml-2 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Enable CORS
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="logRequests"
            checked={settings.api.logRequests}
            onChange={(e) =>
              handleSettingChange("api", "logRequests", e.target.checked)
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="logRequests"
            className={`ml-2 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Log API Requests
          </label>
        </div>
      </div>
    </div>
  );

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.maintenance?.maintenanceMode || false}
          onChange={(e) =>
            handleSettingChange(
              "maintenance",
              "maintenanceMode",
              e.target.checked
            )
          }
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="maintenanceMode"
          className={`ml-2 text-sm font-medium ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Enable Maintenance Mode
        </label>
      </div>

      {settings.maintenance?.maintenanceMode && (
        <div
          className={`p-4 rounded-lg border-l-4 border-yellow-500 ${
            isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50"
          }`}
        >
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div className="ml-3">
              <p
                className={`text-sm ${
                  isDarkMode ? "text-yellow-200" : "text-yellow-800"
                }`}
              >
                Maintenance mode is enabled. Users will see the maintenance
                message.
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Maintenance Message
        </label>
        <textarea
          value={
            settings.maintenance?.maintenanceMessage ||
            "We are currently under maintenance. Please check back later."
          }
          onChange={(e) =>
            handleSettingChange(
              "maintenance",
              "maintenanceMessage",
              e.target.value
            )
          }
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
          maxLength={500}
        />
      </div>

      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Scheduled Maintenance
        </label>
        <input
          type="datetime-local"
          value={
            settings.maintenance?.scheduledMaintenance
              ? new Date(settings.maintenance.scheduledMaintenance)
                  .toISOString()
                  .slice(0, 16)
              : ""
          }
          onChange={(e) =>
            handleSettingChange(
              "maintenance",
              "scheduledMaintenance",
              e.target.value ? new Date(e.target.value).toISOString() : null
            )
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-8">
      {/* Google Analytics */}
      <div
        className={`p-6 border rounded-lg ${
          isDarkMode ? "border-gray-600" : "border-gray-200"
        }`}
      >
        <h4
          className={`text-lg font-medium mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Google Analytics
        </h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="googleAnalyticsEnabled"
              checked={settings.integrations?.googleAnalytics?.enabled || false}
              onChange={(e) => {
                const newGoogleAnalytics = {
                  ...settings.integrations?.googleAnalytics,
                  enabled: e.target.checked,
                };
                handleSettingChange(
                  "integrations",
                  "googleAnalytics",
                  newGoogleAnalytics
                );
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="googleAnalyticsEnabled"
              className={`ml-2 text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Enable Google Analytics
            </label>
          </div>

          {settings.integrations?.googleAnalytics?.enabled && (
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Tracking ID
              </label>
              <input
                type="text"
                value={settings.integrations?.googleAnalytics?.trackingId || ""}
                onChange={(e) => {
                  const newGoogleAnalytics = {
                    ...settings.integrations?.googleAnalytics,
                    trackingId: e.target.value,
                  };
                  handleSettingChange(
                    "integrations",
                    "googleAnalytics",
                    newGoogleAnalytics
                  );
                }}
                placeholder="G-XXXXXXXXXX"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Cloud Storage */}
      <div
        className={`p-6 border rounded-lg ${
          isDarkMode ? "border-gray-600" : "border-gray-200"
        }`}
      >
        <h4
          className={`text-lg font-medium mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Cloud Storage
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Provider
            </label>
            <select
              value={settings.integrations?.cloudStorage?.provider || "local"}
              onChange={(e) => {
                const newCloudStorage = {
                  ...settings.integrations?.cloudStorage,
                  provider: e.target.value,
                };
                handleSettingChange(
                  "integrations",
                  "cloudStorage",
                  newCloudStorage
                );
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="local">Local</option>
              <option value="aws">AWS S3</option>
              <option value="gcp">Google Cloud</option>
              <option value="azure">Azure</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Bucket/Container Name
            </label>
            <input
              type="text"
              value={settings.integrations?.cloudStorage?.bucket || ""}
              onChange={(e) => {
                const newCloudStorage = {
                  ...settings.integrations?.cloudStorage,
                  bucket: e.target.value,
                };
                handleSettingChange(
                  "integrations",
                  "cloudStorage",
                  newCloudStorage
                );
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Region
            </label>
            <input
              type="text"
              value={settings.integrations?.cloudStorage?.region || ""}
              onChange={(e) => {
                const newCloudStorage = {
                  ...settings.integrations?.cloudStorage,
                  region: e.target.value,
                };
                handleSettingChange(
                  "integrations",
                  "cloudStorage",
                  newCloudStorage
                );
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Social Login */}
      <div
        className={`p-6 border rounded-lg ${
          isDarkMode ? "border-gray-600" : "border-gray-200"
        }`}
      >
        <h4
          className={`text-lg font-medium mb-4 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Social Login
        </h4>
        <div className="space-y-6">
          {/* Google Login */}
          <div>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="googleLoginEnabled"
                checked={
                  settings.integrations?.socialLogin?.google?.enabled || false
                }
                onChange={(e) => {
                  const newSocialLogin = {
                    ...settings.integrations?.socialLogin,
                    google: {
                      ...settings.integrations?.socialLogin?.google,
                      enabled: e.target.checked,
                    },
                  };
                  handleSettingChange(
                    "integrations",
                    "socialLogin",
                    newSocialLogin
                  );
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="googleLoginEnabled"
                className={`ml-2 text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Enable Google Login
              </label>
            </div>

            {settings.integrations?.socialLogin?.google?.enabled && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Google Client ID
                </label>
                <input
                  type="text"
                  value={
                    settings.integrations?.socialLogin?.google?.clientId || ""
                  }
                  onChange={(e) => {
                    const newSocialLogin = {
                      ...settings.integrations?.socialLogin,
                      google: {
                        ...settings.integrations?.socialLogin?.google,
                        clientId: e.target.value,
                      },
                    };
                    handleSettingChange(
                      "integrations",
                      "socialLogin",
                      newSocialLogin
                    );
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Facebook Login */}
          <div>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="facebookLoginEnabled"
                checked={
                  settings.integrations?.socialLogin?.facebook?.enabled || false
                }
                onChange={(e) => {
                  const newSocialLogin = {
                    ...settings.integrations?.socialLogin,
                    facebook: {
                      ...settings.integrations?.socialLogin?.facebook,
                      enabled: e.target.checked,
                    },
                  };
                  handleSettingChange(
                    "integrations",
                    "socialLogin",
                    newSocialLogin
                  );
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="facebookLoginEnabled"
                className={`ml-2 text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Enable Facebook Login
              </label>
            </div>

            {settings.integrations?.socialLogin?.facebook?.enabled && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Facebook App ID
                </label>
                <input
                  type="text"
                  value={
                    settings.integrations?.socialLogin?.facebook?.appId || ""
                  }
                  onChange={(e) => {
                    const newSocialLogin = {
                      ...settings.integrations?.socialLogin,
                      facebook: {
                        ...settings.integrations?.socialLogin?.facebook,
                        appId: e.target.value,
                      },
                    };
                    handleSettingChange(
                      "integrations",
                      "socialLogin",
                      newSocialLogin
                    );
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (!settings) return null;

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
      case "maintenance":
        return renderMaintenanceSettings();
      case "integrations":
        return renderIntegrationsSettings();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === "success"
              ? isDarkMode
                ? "bg-green-800 text-green-100"
                : "bg-green-100 text-green-800"
              : isDarkMode
              ? "bg-red-800 text-red-100"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`w-64 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg h-screen sticky top-0`}
        >
          <div className="p-6">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Settings
            </h1>
          </div>

          <nav className="mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? "bg-blue-900 text-blue-100 border-r-2 border-blue-400"
                        : "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                      : isDarkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-sm`}
          >
            {/* Header */}
            <div
              className={`border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              } p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {tabs.find((tab) => tab.id === activeTab)?.label} Settings
                  </h2>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Configure your {activeTab} settings and preferences
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => resetSettings(activeTab)}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => saveSettings(activeTab)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
