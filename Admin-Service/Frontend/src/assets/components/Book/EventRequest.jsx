import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const AllBookingRequests = () => {
    const [status, setStatus] = useState('pending');
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ totalRecords: 0 });
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5001/api/organizer/book/getAllUsersByBookingStatus", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    status,
                    page: 1,
                    limit: 10
                }
            });


            console.log('res: ', res);
            if (res.data.status === 200) {
                setRequests(res.data.data.users);
                setPagination(res.data.data.pagination);
            } else {
                setRequests([]);
                alert(res.data.message);
            }
        } catch (err) {
            console.error(err.message);
            alert('Failed to load booking requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = () => {
        navigate('/book/accept-booking');

    };

    const handleDecline = () => {
        navigate('/book/decline-booking');
    };



    useEffect(() => {
        fetchRequests();
    }, [status, page]);

    return (
        <div>
            <h2>All Booking Requests</h2>

            {/* Filter */}
            <div style={{ marginBottom: '1rem' }}>
                <label>Status: </label>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                    <option value="pending">Pending</option>
                    <option value="booked">Booked</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : requests.length === 0 ? (
                <p>No {status} bookings found.</p>
            ) : (
                <ul>
                    {requests.map((r, index) => (
                        <li key={r.bookingId} style={{ marginBottom: '1rem' }}>
                            <strong>{index + 1}. {r.userName}</strong> ({r.userEmail})<br />
                            Event: {r.eventTitle}<br />
                            Date: {r.eventDate}, {r.eventStartTime} - {r.eventEndTime}<br />
                            Location: {r.eventLocation}<br />
                            Status: {r.status}<br />

                            {status === "pending" && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <button onClick={() => handleAccept()} style={{ marginRight: '0.5rem' }}>
                                        Accept
                                    </button>
                                    <button onClick={() => handleDecline()} style={{ backgroundColor: '#f44336', color: '#fff' }}>
                                        Decline
                                    </button>
                                </div>
                            )}

                            <hr />
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination */}
            {pagination.totalRecords > limit && (
                <div>
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>{' '}
                    <span>Page {page}</span>{' '}
                    <button
                        disabled={page * limit >= pagination.totalRecords}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllBookingRequests;
