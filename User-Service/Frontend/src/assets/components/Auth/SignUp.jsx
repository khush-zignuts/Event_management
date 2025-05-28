import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // import Link
import '../../css/Auth/Signup.css';

const Signup = () => {

    const [formData, setFormData] = useState({ email: '', password: '', name: '', phoneNumber: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/user/auth/signup', formData);
            navigate('/auth/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <form className="signup-form" onSubmit={handleSubmit}>
            <input name="name" onChange={handleChange} placeholder="Name" required />
            <input name="email" onChange={handleChange} placeholder="Email" required />
            <input name="password" type="password" onChange={handleChange} placeholder="Password" required />
            <input name="phoneNumber" onChange={handleChange} placeholder="Phone Number" required />
            <button type="submit">Sign Up</button>

            {error && <p>{error}</p>}

            <p style={{ marginTop: '1rem' }}>
                Already have an account? <Link to="/auth/login">Log in</Link>
            </p>
        </form>
    );
};

export default Signup;
