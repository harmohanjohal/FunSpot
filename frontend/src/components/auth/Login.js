import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormField from '../common/FormField';
import { useForm } from '../../hooks/useForm';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { form, updateForm } = useForm({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get redirect path if it exists
  const redirectPath = location.state?.redirectTo || '/dashboard';

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email format
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(form.email, form.password);
      
      // Navigate to redirect path or dashboard based on user role
      navigate(redirectPath);
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Login to FunSpot</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {location.state?.redirectTo && (
        <div className="alert alert-info">
          Please log in to continue booking your event.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
          required
        />
        
        <FormField
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => updateForm('password', e.target.value)}
          required
        />
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-links">
        {/* <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p> */}
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;