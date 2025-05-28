import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


const RegisterEvent = () => {
  const { id } = useParams();
  console.log('id: ', id);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBook = async () => {
    try {
      setIsLoading(true);
      setStatusMessage('');
      const token = localStorage.getItem('token');
      console.log('token: ', token);

      const res = await axios.post(
        `http://localhost:5000/api/user/book/event/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStatusMessage(res.data.message || 'Booking successful.');
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to book the event.';
      setStatusMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={handleBook} disabled={isLoading}>
        {isLoading ? 'Booking...' : 'Book This Event'}
      </button>

      {statusMessage && (
        <p style={{ marginTop: '0.5rem', color: '#d9534f' }}>{statusMessage}</p>
      )}
    </div>
  );
};

export default RegisterEvent;
