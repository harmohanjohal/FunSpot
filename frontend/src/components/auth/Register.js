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
    <div className="auth-form-container">
      <h2 className="auth-form-title">Register</h2>
      
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
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
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-control ${passwordStrength ? `strength-${passwordStrength}` : ''}`}
            value={form.password}
            onChange={handlePasswordChange}
            required
          />
          {passwordStrength && (
            <div className={`password-strength strength-${passwordStrength}`}>
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
        
        <div className="form-group">
          <label>Register as:</label>
          <div>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                name="role"
                value="user"
                checked={form.role === 'user'}
                onChange={(e) => updateForm('role', e.target.value)}
                style={{ marginRight: '5px' }}
              />
              Standard User
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={form.role === 'admin'}
                onChange={(e) => updateForm('role', e.target.value)}
                style={{ marginRight: '5px' }}
              />
              Admin
            </label>
          </div>
        </div>
        
        {/* Show admin password field if admin role is selected */}
        {form.role === 'admin' && (
          <FormField
            id="adminPassword"
            label="Admin Password"
            type="password"
            value={form.adminPassword}
            onChange={(e) => updateForm('adminPassword', e.target.value)}
            required={form.role === 'admin'}
          />
        )}
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;