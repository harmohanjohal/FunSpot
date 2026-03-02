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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full rounded-2xl p-8 shadow-2xl" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--border-strong)' }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, rgba(58, 175, 169, 0.18), rgba(43, 122, 120, 0.18))' }}>
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>Login to FunSpot</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Enter your credentials to access your account</p>
        </div>

        {error && <div className="p-4 mb-6 rounded-lg border font-medium text-sm flex items-center gap-2" style={{ background: 'var(--danger-bg)', borderColor: 'rgba(198,40,40,0.25)', color: 'var(--danger)' }}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>}

        {location.state?.redirectTo && (
          <div className="p-4 mb-6 rounded-lg border font-medium text-sm flex items-center gap-2" style={{ background: 'var(--info-bg)', borderColor: 'rgba(58,175,169,0.25)', color: '#2B7A78' }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Please log in to continue booking your event.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 15px rgba(58, 175, 169, 0.3)' }}
          >
            {loading ? (
              <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Logging in...</>
            ) : 'Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 flex flex-col items-center gap-4 text-sm" style={{ borderTop: '1px solid var(--border-strong)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" className="font-semibold transition-colors" style={{ color: 'var(--accent-text)' }}>Register</Link>
          </p>
          <Link to="/" className="font-medium transition-colors flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;