import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const AdminRegisterPage = () => {
  // Mock auth context data - replace with actual useContext(AuthContext) in your app
  const [authState, setAuthState] = useState({
    adminRegisterInProgress: false,
    isAdminAuthenticated: true,
    currentAdmin: { role: 'superadmin', isAdmin: true }
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Mock navigation function - replace with useNavigate() in your app
  const navigate = (path) => {
    console.log(`Navigate to: ${path}`);
  };

  // Mock register function - replace with actual registerAdmin from context
  const registerAdmin = async (adminData) => {
    // Simulate API call
    setAuthState(prev => ({ ...prev, adminRegisterInProgress: true }));
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setAuthState(prev => ({ ...prev, adminRegisterInProgress: false }));
        
        // Simulate success/failure
        if (adminData.userName === 'existing') {
          reject(new Error('Admin with username already exists'));
        } else {
          resolve({ data: { message: 'Admin registered successfully' } });
        }
      }, 2000);
    });
  };

  // Check if current user has permission to register admins
  const canRegisterAdmin = authState.isAdminAuthenticated && (
    authState.currentAdmin?.role === 'superadmin' || 
    authState.currentAdmin?.isAdmin === true
  );

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    } else if (formData.userName.trim().length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general errors
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canRegisterAdmin) {
      setSubmitError('You do not have permission to register admins');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const adminData = {
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        userName: formData.userName.toLowerCase().trim(),
        password: formData.password,
        role: formData.role
      };

      await registerAdmin(adminData);
      
      setSubmitSuccess('Admin registered successfully!');
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        userName: '',
        password: '',
        confirmPassword: '',
        role: 'admin'
      });

      // Optionally redirect after success
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Failed to register admin. Please try again.');
      }
    }
  };

  // Redirect if not authorized
  if (!authState.isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You must be logged in as an admin to access this page.</p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!canRegisterAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600 mb-4">You do not have permission to register new admins.</p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <UserPlus className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register New Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a new administrator account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-green-700">{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700">{submitError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.userName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter username"
                />
              </div>
              {errors.userName && (
                <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="admin">Admin</option>
                {authState.currentAdmin?.role === 'superadmin' && (
                  <option value="superadmin">Super Admin</option>
                )}
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={authState.adminRegisterInProgress}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  authState.adminRegisterInProgress
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {authState.adminRegisterInProgress ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register Admin'
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Demo Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Instructions:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Try entering "existing" as username to see error handling</li>
              <li>• All form validations are working</li>
              <li>• Password visibility toggles work</li>
              <li>• Replace mock functions with your actual AuthContext</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input