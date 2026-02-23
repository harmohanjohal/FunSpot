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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Profile Management</h2>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/events">View Events</Link>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      
      <div className="dashboard-card">
        <h3 className="dashboard-title">Update Profile</h3>
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={userData.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={userData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={userData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="form-control"
              value={userData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
      
      <div className="dashboard-card">
        <h3 className="dashboard-title">Change Password</h3>
        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              className={`form-control ${passwordStrength ? `strength-${passwordStrength}` : ''}`}
              value={newPassword}
              onChange={handlePasswordChange}
            />
            {passwordStrength && (
              <div className={`password-strength strength-${passwordStrength}`}>
                Password strength: {passwordStrength}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={loading || !newPassword}
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileManagement;