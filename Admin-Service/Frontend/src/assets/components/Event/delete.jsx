// Delete.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Delete = () => {
    const { id } = useParams();
    console.log('id: ', id);
    const navigate = useNavigate();

    useEffect(() => {
        const deleteEvent = async () => {
            const confirmed = window.confirm('Are you sure you want to delete this event?');
            if (!confirmed) {
                navigate(`/event/event-details/${id}`);
                return;
            }

            try {
                const token = localStorage.getItem('token');

                const res = await axios.post(`http://localhost:5001/api/organizer/event/delete/${id}`, null, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.status === 200) {
                    alert('Event deleted successfully');
                    navigate('/dashboard');
                }

            } catch (error) {
                console.error('Delete event error:', error.message);
                alert('Failed to delete event');
                navigate(`/dashboard`);
            }
        };

        deleteEvent();
    }, [id, navigate]);

    return <p>Deleting event...</p>;
};

export default Delete;
