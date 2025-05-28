import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(`http://localhost:5001/api/organizer/event/getAllEventsBySearch`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: query,
            page: currentPage,
          },
        });

        console.log('res: ', res);

        const fetchedEvents = res.data.data.events;
        setEvents(fetchedEvents);
        setTotalPages(res.data.data.totalPages);

        if (fetchedEvents.length === 0) {
          alert(res.data.message || 'No events found');
        }
      } catch (error) {
        console.error('Error fetching events:', error.message);
        alert('Failed to fetch events');
      }
    };

    fetchEvents();
  }, [query, currentPage]);


  const handleCreateEvent = () => {
    navigate('/event/create-event');
  };
  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBookEvent = async () => {
    navigate('/book/event-request');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1> <p>Welcome, {localStorage.getItem('organizerName')}</p></h1>
        <h2 className="dashboard-title">All Events</h2>


        <div className="dashboard-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for an event..."
              value={query}
              onChange={handleSearchChange}
            />
          </div>

          <div className="action-buttons">
            <button className="create-event-btn" onClick={handleCreateEvent}>Create </button>
            <button className="book-button" onClick={handleBookEvent}>Booking Requests</button>
            <button className="chat-button" onClick={() => navigate(`/event/Organizer-Chats`)}>
              💬 Chat
            </button>

            <button className="logout-button" onClick={() => navigate('/auth/logout')}>Logout</button>
          </div>
        </div>

      </div>



      <div className="event-grid">
        {events.length === 0 ? (
          <p>No events found</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card clickable">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {new Date(Number(event.date)).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
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


    </div >
  );
};

export default Dashboard;
