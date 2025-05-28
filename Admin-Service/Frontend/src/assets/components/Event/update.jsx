// UpdateEvent.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import '../css/UpdateEvent.css';

const UpdateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        capacity: '',
        category: '',
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5001/api/organizer/event/getEventById/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const event = res.data.data;
                setFormData({
                    title: event.title || '',
                    description: event.description || '',
                    location: event.location || '',
                    date: new Date(Number(event.date)).toISOString().split('T')[0],
                    startTime: event.startTime || '',
                    endTime: event.endTime || '',
                    capacity: event.capacity || '',
                    category: event.category || '',
                });
            } catch (error) {
                console.error('Error loading event:', error);
                alert('Failed to load event data');
            }
        };

        fetchEvent();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            await axios.post(
                `http://localhost:5001/api/organizer/event/update/${id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );


            alert('Event updated successfully!');
            navigate(`/event/event-details/${id}`);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update event');
        }
    };


    return (
        <div className="update-event-container">
            <h2>Update Event</h2>
            <form onSubmit={handleSubmit} className="update-event-form">
                {[
                    { label: 'Title', name: 'title', type: 'text' },
                    { label: 'Description', name: 'description', type: 'text' },
                    { label: 'Location', name: 'location', type: 'text' },
                    { label: 'Date', name: 'date', type: 'date' },
                    { label: 'Start Time', name: 'startTime', type: 'time' },
                    { label: 'End Time', name: 'endTime', type: 'time' },
                    { label: 'Capacity', name: 'capacity', type: 'number' },
                    { label: 'Category', name: 'category', type: 'text' },
                ].map(({ label, name, type }) => (
                    <div className="form-group" key={name}>
                        <label>{label}:</label>
                        <input
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}

                <button type="submit" className="submit-btn">Update Event</button>
            </form>
        </div>
    );
};

export default UpdateEvent;
