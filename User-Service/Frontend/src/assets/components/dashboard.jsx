import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../css/dashboard.css";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(`http://localhost:5000/api/user/event/search`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            query,
            page: currentPage,
          },

        });

        setEvents(res.data.data.events);
        setTotalPages(res.data.data.totalPages);
      } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to fetch events');
      }
    };

    fetchEvents();
  }, [query, currentPage]);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><p>Welcome, {localStorage.getItem('username')}</p></h1>
        <h2 className="dashboard-title">All Events</h2>

        <div className="dashboard-controls-row">
          <button className="notification-button" onClick={() => navigate('/event/notifications')}>
            🔔 Notifications
          </button>

          <button className="booked-events-button" onClick={() => navigate('/Book/AllBookedEvents')}>
            📚 All Booked Events
          </button>



          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for an event..."
              value={query}
              onChange={handleSearchChange}
            />
          </div>

          <button className="logout-button" onClick={() => navigate('/auth/logout')}>
            Logout
          </button>
        </div>


      </div>

      <div className="event-grid">
        {events.length === 0 ? (
          <p>No events found</p>
        ) : (
          events.map((event) => (
            <div className="event-card clickable" key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {new Date(Number(event.date)).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.startTime} To {event.endTime}</p>
              <p><strong>Location:</strong> {event.location}</p>

              <button
                className="view-button"
                onClick={() => navigate(`/event/event-details/${event.id}`)}
              >
                View
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

export default Dashboard;
