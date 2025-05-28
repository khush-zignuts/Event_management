import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import './Notifications.css'; // Import the CSS file

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('token: ', token);
      const res = await axios.get('http://localhost:5000/api/user/event/notifications', {
        headers: { Authorization: `Bearer ${token}` },
        params: { type, page, limit },
      });

      setNotifications(res.data.data.notifications);
      setTotalRecords(res.data.data.totalRecords);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      alert('Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [type, page]);

  const totalPages = Math.ceil(totalRecords / limit);

  const getNotificationClass = (notificationType) => {
    return `notification-item ${notificationType.toLowerCase()}`;
  };

  const getTypeClass = (notificationType) => {
    return `notification-type ${notificationType.toLowerCase()}`;
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1 className="notifications-title">Notifications</h1>
        <select 
          className="filter-dropdown"
          value={type} 
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="event">Event</option>
          <option value="announcement">Announcement</option>
          <option value="reminder">Reminder</option>
        </select>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            No notifications found.
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className={getNotificationClass(n.type)}>
              <h3 className="notification-title">{n.title}</h3>
              <p className="notification-message">{n.message}</p>
              <span className={getTypeClass(n.type)}>Type: {n.type}</span>
            </div>
          ))
        )}
      </div>

      <div className="pagination-container">
        <button 
          className="button back-button" 
          onClick={() => navigate('/dashboard')}
        >
          ⬅ Back to Dashboard
        </button>
        <div>
          {page > 1 && (
            <button 
              className="button page-button" 
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
          )}
          {page < totalPages && (
            <button 
              className="button page-button" 
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;