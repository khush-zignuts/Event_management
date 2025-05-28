import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onMessageListener } from "../../../firebase";


const AcceptUser = ({ fcmToken }) => {
  const [notification, setNotification] = useState(null);
  const [userId, setUserId] = useState("");
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("fcmToken in AA: ", fcmToken);

  // Listen to push notification
  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        setNotification(payload.notification);
      })
      .catch((err) => console.error("Notification error:", err));
  }, []);

  // Show toast when notification is received
  useEffect(() => {
    if (notification) {
      toast(
        <div>
          <strong>{notification.title}</strong>
          <p>{notification.body}</p>
        </div>,
        { position: "top-right" }
      );
    }
  }, [notification]);

  const handleAccept = async () => {
    if (!userId.trim() || !eventId.trim()) {
      return toast.warn("Please provide both User ID and Event ID");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('token: ', token);

      const response = await axios.post(
        `http://localhost:5001/api/organizer/book/acceptUser`,
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

      toast.success(response.data.message || "User accepted!");
      // Clear form after success
      setUserId("");
      setEventId("");
    } catch (error) {
      console.error("Accept error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
        "Something went wrong while accepting the user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accept-user-container" style={{ maxWidth: 400, margin: "2rem auto" }}>
      <ToastContainer />
      <h2>Accept User for Event</h2>

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
        onClick={handleAccept}
        disabled={loading}
        style={{
          padding: "0.6rem 1.2rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : "Accept User"}
      </button>
    </div>
  );
};

export default AcceptUser;
