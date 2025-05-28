import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/Auth/verifyOtp.css';


const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/user/auth/verifyOTP', { email, otp });
            navigate('/auth/login');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        }
    };

    return (
        <form className="otp-form" onSubmit={handleSubmit}>
            <h3>Enter OTP sent to: {email}</h3>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" required />
            <button type="submit">Verify OTP</button>
            {error && <p>{error}</p>}
        </form>
    );
};

export default VerifyOTP;
