import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormField from '../common/FormField';
import useForm from '../../hooks/useForm';
import useAlert from '../../hooks/useAlert';

// Role options
const roleOptions = [
  { value: 'user', label: 'Standard User' },
  { value: 'admin', label: 'Admin' }
];

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form state using custom hook
  const { form, updateForm } = useForm({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    adminPassword: '',
  });

  const { alert, showError, clearAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength('weak');
      return false;
    }

    // Check for mix of letters and numbers
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);

    if (hasLetters && hasNumbers) {
      if (password.length >= 8) {
        setPasswordStrength('strong');
      } else {
        setPasswordStrength('medium');
      }
      return true;
    } else {
      setPasswordStrength('weak');
      return false;
    }
  };

  // Handle password field change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    updateForm('password', value);
    checkPasswordStrength(value);
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(form.email)) {
      return showError('Please enter a valid email address');
    }

    // Validate password strength
    if (!checkPasswordStrength(form.password)) {
      return showError('Password should be at least 6 characters and include both letters and numbers');
    }

    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      return showError('Passwords do not match');
    }

    try {
      clearAlert();
      setLoading(true);

      // Prepare user data for Firestore
      const userData = {
        name: form.name,
        username: form.username,
        phoneNumber: form.phoneNumber,
      };

      const isAdmin = form.role === 'admin';

      await register(
        form.email,
        form.password,
        userData,
        isAdmin,
        form.adminPassword
      );

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);

      if (error.message === 'Invalid admin password') {
        showError('Invalid admin password');
      } else if (error.code === 'auth/email-already-in-use') {
        showError('Email already in use');
      } else {
        showError('Failed to create an account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join FunSpot to book tickets and manage your events</p>
        </div>

        {alert.show && (
          <div className={`p-4 mb-6 rounded-lg border font-medium text-sm flex items-center gap-2 ${alert.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' :
              alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {alert.type === 'danger' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> :
                alert.type === 'success' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> :
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
            </svg>
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              id="name"
              label="Full Name"
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              required
            />

            <FormField
              id="username"
              label="Username"
              type="text"
              value={form.username}
              onChange={(e) => updateForm('username', e.target.value)}
              required
            />

            <FormField
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              required
            />

            <FormField
              id="phoneNumber"
              label="Phone Number"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => updateForm('phoneNumber', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="mb-4">
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 transition-colors ${passwordStrength === 'weak' ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' :
                    passwordStrength === 'medium' ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500 bg-yellow-50' :
                      passwordStrength === 'strong' ? 'border-green-400 focus:ring-green-500 focus:border-green-500 bg-green-50' : ''
                  }`}
                value={form.password}
                onChange={handlePasswordChange}
                required
              />
              {passwordStrength && (
                <div className={`mt-1.5 text-xs font-semibold ${passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-500'
                  }`}>
                  Password strength: {passwordStrength}
                </div>
              )}
            </div>

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateForm('confirmPassword', e.target.value)}
              required
            />
          </div>

          <div className="mb-4 pt-4 border-t border-gray-100">
            <label className="block mb-3 text-sm font-medium text-gray-700">Register as:</label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={form.role === 'user'}
                  onChange={(e) => updateForm('role', e.target.value)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Standard User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={form.role === 'admin'}
                  onChange={(e) => updateForm('role', e.target.value)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Admin Developer</span>
              </label>
            </div>
          </div>

          {/* Show admin password field if admin role is selected */}
          {form.role === 'admin' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-3 text-orange-800 font-medium text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Admin Authorization Required
              </div>
              <FormField
                id="adminPassword"
                label="Admin Passcode"
                type="password"
                value={form.adminPassword}
                onChange={(e) => updateForm('adminPassword', e.target.value)}
                required={form.role === 'admin'}
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Registering...</>
              ) : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4 text-sm">
          <p className="text-gray-600">
            Already have an account? <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">Login</Link>
          </p>
          <Link to="/" className="font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;