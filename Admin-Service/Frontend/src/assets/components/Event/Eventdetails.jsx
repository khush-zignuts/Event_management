// EventDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(`http://localhost:5001/api/organizer/event/getEventById/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvent(res.data.data);

      } catch (error) {
        console.error('Error fetching event:', error);
        alert('Failed to fetch event details');
      }
    };

    fetchEvent();
  }, [id]);

  const handleEditClick = () => {
    navigate(`/event/update-event/${id}`);
  };

  const handleDeleteClick = () => {
    navigate(`/event/delete-event/${id}`);
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div className="event-details">
      <h2>{event.title}</h2>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Date:</strong> {new Date(Number(event.date)).toLocaleDateString()}</p>
      <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
      <p><strong>Location:</strong> {event.location}</p>

      <button onClick={handleEditClick}>Edit</button>
      <button onClick={handleDeleteClick} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
        Delete
      </button>
      <button onClick={() => navigate('/dashboard')} style={{ marginLeft: '10px' }}>
        Dashboard
      </button>


    </div>
  );
};

export default EventDetails;
