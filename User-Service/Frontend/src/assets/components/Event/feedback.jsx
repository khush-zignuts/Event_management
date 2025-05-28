import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Feedback = () => {
    const { id } = useParams();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRatingChange = (event) => {
        setRating(event.target.value);
    };

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const handleSubmit = async () => {
        if (!rating || !comment) {
            alert('Please provide both rating and comment');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            const res = await axios.post(
                `http://localhost:5000/api/user/event/submiteventfeedback`,
                { eventId: id, rating, comment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('res: ', res);

            alert('Feedback submitted successfully!');
            navigate(`/event/event-details/${id}`);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="event-feedback">
            <h2>Give Feedback for Event</h2>

            {/* Rating Input */}
            <div className="rating">
                <label htmlFor="rating">Rating (1-5): </label>
                <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={rating}
                    min="1"
                    max="5"
                    onChange={handleRatingChange}
                    required
                />
            </div>

            {/* Comment Input */}
            <div className="comment">
                <label htmlFor="comment">Comment: </label>
                <textarea
                    id="comment"
                    name="comment"
                    value={comment}
                    onChange={handleCommentChange}
                    rows="5"
                    cols="50"
                    placeholder="Write your feedback here..."
                    required
                />
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>

            {/* Back Button */}
            <button onClick={() => navigate(`/event/details/${id}`)} style={{ marginTop: '10px' }}>
                Back to Event
            </button>
        </div>
    );
};

export default Feedback;
