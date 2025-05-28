import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const AllBookedEvents = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookedEvents = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:5000/api/user/book/getAllBookedEventsOrById', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
          },
        });

        setBookedEvents(response.data.data.events);
        const total = response.data.data.totalRecords;
        const limit = 10; // default from backend
        setTotalPages(Math.ceil(total / limit));
      } catch (error) {
        console.error('Error fetching booked events:', error);
        alert('Failed to fetch booked events');
      }
    };

    fetchBookedEvents();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>📚 Your Booked Events</h2>
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="event-grid">
        {bookedEvents.length === 0 ? (
          <p>No booked events found.</p>
        ) : (
          bookedEvents.map((event) => (
            <div className="event-card clickable" key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {new Date(Number(event.date)).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.start_time} - {event.end_time}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Category:</strong> {event.category}</p>

              <button
                className="view-button"
                onClick={() => navigate(`/event/event-details/${event.id}`)}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
        )}
        {currentPage < totalPages && (
          <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
        )}
      </div>
    </div>
  );
};

export default AllBookedEvents;
