import React, { useState } from 'react';
import axios from 'axios';
import { redirect, useParams } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/user/auth/reset-password', {
                email: formData.email,
                token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });
            setStatus(res.data.message || 'Password reset successful.');
            redirect('/auth/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="reset-password-form">
            <h2>Reset Password</h2>

            <div className="form-group email-field">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group new-password-field">
                <label htmlFor="newPassword">New Password</label>
                <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group confirm-password-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit">Reset Password</button>

            {status && <p className="success">{status}</p>}
            {error && <p className="error">{error}</p>}
        </form>

    );
};

export default ResetPassword;
