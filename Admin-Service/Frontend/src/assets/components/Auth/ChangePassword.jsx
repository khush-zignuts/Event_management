import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
; // Optional, if you want to reuse styles

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');

            const res = await axios.put(
                'http://localhost:5001/api/organizer/auth/change-password',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccess(res.data.message || 'Password changed successfully');
            setFormData({ currentPassword: '', newPassword: '' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to change password'
            );
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h2>Change Password</h2>

            <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
            />

            <button type="submit">Change Password</button>

            {success && <p className="success">{success}</p>}
            {error && <p className="error">{error}</p>}
        </form>
    );
};

export default ChangePassword;
