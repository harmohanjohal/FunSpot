// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// function () {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { resetPassword } = useAuth();

//   // Email validation function
//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(String(email).toLowerCase());
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate email format
//     if (!validateEmail(email)) {
//       return setError('Please enter a valid email address');
//     }
    
//     try {
//       setMessage('');
//       setError('');
//       setLoading(true);
//       await resetPassword(email);
//       setMessage('Password reset instructions sent to your email');
//     } catch (error) {
//       setError('Failed to reset password. Please check your email address.');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-form-container">
//       <h2 className="auth-form-title">Reset Password</h2>
      
//       {error && <div className="alert alert-danger">{error}</div>}
//       {message && <div className="alert alert-success">{message}</div>}
      
//       <form onSubmit={handleSubmit} className="auth-form">
//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             className="form-control"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
        
//         <button 
//           type="submit" 
//           className="btn" 
//           disabled={loading}
//         >
//           {loading ? 'Sending...' : 'Reset Password'}
//         </button>
//       </form>
      
//       <div className="auth-links">
//         <p>
//           <Link to="/login">Back to Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default ;