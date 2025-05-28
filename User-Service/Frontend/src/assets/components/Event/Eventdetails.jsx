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

        const res = await axios.get(`http://localhost:5000/api/user/event/getEventById/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const eventData = res.data.data;
        setEvent(eventData);

      } catch (error) {
        console.error('Error fetching event:', error);
        alert('Failed to fetch event details');
      }
    };

    fetchEvent();
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <div className="event-details">
      <h2>{event.title}</h2>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Date:</strong> {new Date(Number(event.date)).toLocaleDateString()}</p>
      <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
      <p><strong>Location:</strong> {event.location}</p>

      {/* Buttons row */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => navigate(`/Book/event/${id}`)}>
          Book Event
        </button>

        <button onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>

        <button
          onClick={() => navigate(`/event/chat/${id}`)}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
          }}
        >
          Chat
        </button>

        <button
          onClick={() => navigate(`/event/feedback/${id}`)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
          }}
        >
          Give Feedback
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
