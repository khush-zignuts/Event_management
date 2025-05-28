// import React, { useState } from 'react';
// import axios from 'axios';

// const ResetPassword = () => {
//     const [formData, setFormData] = useState({
//         email: '',
//         token: '',
//         newPassword: '',
//     });
//     const [status, setStatus] = useState('');
//     const [error, setError] = useState('');

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setStatus('');
//         setError('');
//         try {
//             const res = await axios.post('http://localhost:5001/api/organizer/auth/reset-password', formData);
//             setStatus(res.data.message || 'Password reset successful.');
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to reset password.');
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="reset-password-form">
//             <h2>Reset Password</h2>
//             <input
//                 type="email"
//                 name="email"
//                 placeholder="Your email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//             />
//             <input
//                 type="text"
//                 name="token"
//                 placeholder="Reset token"
//                 value={formData.token}
//                 onChange={handleChange}
//                 required
//             />
//             <input
//                 type="password"
//                 name="newPassword"
//                 placeholder="New password"
//                 value={formData.newPassword}
//                 onChange={handleChange}
//                 required
//             />
//             <button type="submit">Reset Password</button>

//             {status && <p className="success">{status}</p>}
//             {error && <p className="error">{error}</p>}
//         </form>
//     );
// };

// export default ResetPassword;
