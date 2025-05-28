import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/Auth/Login.css';


const Login = ({ fcmToken }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value, fcmToken });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/organizer/auth/login', formData);
            console.log('res.data.data.: ', res.data.data);
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('organizerName', res.data.data.organizerName);
            localStorage.setItem('organizerId', res.data.data.organizerId);
            alert('Login successful');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            {/* Username */}
            <label className="input validator">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </g>
                </svg>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                    minlength="3"
                    maxlength="30"

                />
            </label>


            {/* password */}
            <label className="input validator">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                        ></path>
                        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                    </g>
                </svg>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    minlength="8"
                    title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                />
            </label>
            <button type="submit">Login</button>

            {/* Updated Links */}
            <div className="login-links">
                <h2 onClick={() => navigate('/auth/forgot-password')}>Forgot Password?</h2>
                <h2 onClick={() => navigate('/auth/change-password')}>Change Password</h2>
            </div>

            <div className="signup-links">
                <p>Don't have an account? <span className="signin-link" onClick={() => navigate('/auth/signUp')}>Sign up</span></p>
            </div>



            {error && <p className="error">{error}</p>}
        </form>

    );
};

export default Login;
