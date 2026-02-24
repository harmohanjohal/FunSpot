import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

function ProfileManagement() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.name || '',
              username: data.username || '',
              email: currentUser.email || '',
              phoneNumber: data.phoneNumber || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Error loading profile data');
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return '';

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserData({
      ...userData,
      [name]: value
    });
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    checkPasswordStrength(value);
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(userData.email)) {
      return setError('Please enter a valid email address');
    }

    try {
      setError('');
      setLoading(true);

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: userData.name,
        username: userData.username,
        phoneNumber: userData.phoneNumber,
      });

      // Update email if changed
      if (userData.email !== currentUser.email) {
        await updateEmail(currentUser, userData.email);
      }

      setMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Check password strength
    if (!checkPasswordStrength(newPassword)) {
      return setError('Password should be at least 6 characters and include both letters and numbers');
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);

      // Update password
      await updatePassword(currentUser, newPassword);

      setMessage('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength('');
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. You may need to log in again before changing your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm mb-8 mt-4 gap-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)', borderWidth: '1px' }}>
        <h2 className="m-0" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Profile Management</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/dashboard" className="btn-secondary-action py-2">Dashboard</Link>
          <Link to="/events" className="btn-secondary-action py-2">View Events</Link>
          <button onClick={handleLogout} className="btn-secondary-action py-2" style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>Logout</button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}
      {message && (
        <div className="p-4 mb-6 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 m-0">Update Profile</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-2xl">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 transition-colors"
                value={userData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 transition-colors"
                value={userData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 transition-colors"
                value={userData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 transition-colors"
                value={userData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary-action flex items-center gap-2"
                style={{ margin: 0 }}
                disabled={loading}
              >
                {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 m-0">Change Password</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-md">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                id="newPassword"
                className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 transition-colors ${passwordStrength === 'weak' ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' :
                  passwordStrength === 'medium' ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500 bg-yellow-50' :
                    passwordStrength === 'strong' ? 'border-green-400 focus:ring-green-500 focus:border-green-500 bg-green-50' : ''
                  }`}
                value={newPassword}
                onChange={handlePasswordChange}
              />
              {passwordStrength && (
                <div className={`mt-1.5 text-xs font-medium ${passwordStrength === 'weak' ? 'text-red-500' :
                  passwordStrength === 'medium' ? 'text-yellow-600' :
                    'text-green-500'
                  }`}>
                  Password strength: <span className="uppercase">{passwordStrength}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block focus:outline-none focus:ring-2 transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary-action flex items-center gap-2"
                style={{ margin: 0 }}
                disabled={loading || !newPassword}
              >
                {loading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileManagement;