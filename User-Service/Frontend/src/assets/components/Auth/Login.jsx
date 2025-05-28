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
            const res = await axios.post('http://localhost:5000/api/user/auth/login', formData);
            console.log('res.data.data.: ', res.data.data);
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('username', res.data.data.username);
            localStorage.setItem('userId', res.data.data.userId);
            alert('Login successful');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
            />
            <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
            />
            <button type="submit">Login</button>

            {/* Updated Links */}
            <div className="login-links">
                <h2 onClick={() => navigate('/auth/forgot-password')}>Forgot Password?</h2>
                <h2 onClick={() => navigate('/auth/change-password')}>Change Password</h2>
            </div>

            {error && <p className="error">{error}</p>}
        </form>

    );
};

export default Login;
