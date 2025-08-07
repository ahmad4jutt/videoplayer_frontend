import React, { useState, useEffect } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { checkLockoutStatus } from "../../services/api"; // Adjust the import path as needed

const AccountLockoutTimer = ({
  lockoutExpiry,
  onLockoutExpired,
  onRetryLogin,
  userEmail,
  userName,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!lockoutExpiry) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(lockoutExpiry).getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        if (onLockoutExpired) {
          onLockoutExpired();
        }
      } else {
        setTimeRemaining(remaining);
        setIsExpired(false);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockoutExpiry, onLockoutExpired]);

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return "00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleRetryLogin = async () => {
    setIsChecking(true);
    try {
      // Prepare data for API call - use email or userName
      const requestData = {};
      if (userEmail) requestData.email = userEmail;
      if (userName) requestData.userName = userName;

      // Check if account is still locked using the API
      const response = await checkLockoutStatus(requestData);

      if (response.data.success && !response.data.isLocked) {
        // Account is unlocked, allow retry
        if (onRetryLogin) {
          onRetryLogin();
        }
      } else if (response.data.isLocked) {
        // Still locked, update the expiry time if provided
        if (response.data.data?.lockoutExpiry) {
          // Update lockout expiry if backend provides new time
          setTimeRemaining(
            new Date(response.data.data.lockoutExpiry).getTime() -
              new Date().getTime()
          );
        }
      }
    } catch (error) {
      console.error("Error checking lockout status:", error);
      // Allow retry anyway in case of network issues
      if (onRetryLogin) {
        onRetryLogin();
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="mt-4">
      {!isExpired ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-semibold">
              Account Locked
            </span>
          </div>

          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-orange-700 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-orange-600 text-sm">
              Time remaining until account unlock
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-green-800 font-semibold mb-2">
              Account Unlocked!
            </h4>
            <p className="text-green-600 text-sm mb-4">
              You can now try logging in again.
            </p>
            <button
              onClick={handleRetryLogin}
              disabled={isChecking}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
            >
              {isChecking ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Checking...
                </div>
              ) : (
                "Try Login Again"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLockoutTimer;
