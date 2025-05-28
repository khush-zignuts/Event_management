import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onMessageListener } from "../../../firebase"; // adjust if needed

const DeclineUser = ({ fcmToken }) => {
  const [notification, setNotification] = useState(null);
  const [userId, setUserId] = useState("");
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen to Firebase push notification
  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        setNotification(payload.notification);
      })
      .catch((err) => console.error("Notification error:", err));
  }, []);

  // Show toast for notification
  useEffect(() => {
    if (notification) {
      toast.info(
        <div>
          <strong>{notification.title}</strong>
          <p>{notification.body}</p>
        </div>,
        { position: "top-right" }
      );
    }
  }, [notification]);

  const handleDecline = async () => {
    if (!userId.trim() || !eventId.trim()) {
      return toast.warn("Please provide both User ID and Event ID");
    }

    setLoading(true);

    try {

      const token = localStorage.getItem('token');

      const response = await axios.post(
        "http://localhost:5001/api/organizer/book/declineUser",
        {
          userId,
          eventId,
          fcmToken,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message || "User declined successfully.");
      setUserId("");
      setEventId("");
    } catch (error) {
      console.error("Decline error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Something went wrong while declining user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="decline-user-container" style={{ maxWidth: 400, margin: "2rem auto" }}>
      <ToastContainer />
      <h2>Decline User for Event</h2>

      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />

      <input
        type="text"
        placeholder="Event ID"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
      />

      <button
        onClick={handleDecline}
        disabled={loading}
        style={{
          padding: "0.6rem 1.2rem",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : "Decline User"}
      </button>
    </div>
  );
};

export default DeclineUser;
