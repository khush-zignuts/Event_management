import React, { useState } from 'react';
import axios from 'axios';
import '../../css/Auth/LogOut.css'; // Assuming you have a CSS file for styling

const Logout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogout = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/user/logout', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            localStorage.removeItem('token');
            // Redirect to login page
        } catch (error) {
            console.log('error: ', error);
            setError(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Log Out'}
        </button>
    );
};

export default Logout;
