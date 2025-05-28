// import React, { useState } from 'react';
// import axios from 'axios';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [status, setStatus] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('');
//     setError('');
//     try {
//       const res = await axios.post('http://localhost:5001/api/organizer/auth/forgot-password', {
//         email,
//       });
//       setStatus(res.data.message || 'Password reset link sent.');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to send reset link.');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="forgot-password-form">
//       <h2>Forgot Password</h2>
//       <input
//         type="email"
//         placeholder="Enter your email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <button type="submit">Send Reset Link</button>

//       {status && <p className="success">{status}</p>}
//       {error && <p className="error">{error}</p>}
//     </form>
//   );
// };

// export default ForgotPassword;
