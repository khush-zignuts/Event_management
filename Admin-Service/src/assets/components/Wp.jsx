// Wp.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import '../css/Wp.css';
import { Navigate } from 'react-router-dom';


const socket = io('http://localhost:8001');

const Wp = () => {
  const [loggedInUser, setLoggedInUser] = useState({});
  const [users, setUsers] = useState([]);
  const [currentReceiver, setCurrentReceiver] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [addedDates, setAddedDates] = useState(new Set());

  const chatBoxRef = useRef(null);

  const token = localStorage.getItem("token");

  // Fetch logged-in user
  const fetchLoginUser = async () => {
    try {
      const res = await axios.get("http://localhost:8001/api/action/getLoginUser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = res.data.data;
      setLoggedInUser(user);
      socket.emit("register", user);
    } catch (err) {
      console.error("Error fetching logged-in user:", err.message);
    }
  };

  // Fetch user list
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8001/api/action/getUser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Fetch or create chat
  const fetchOrCreateChat = async (user1Id, user2Id) => {
    try {
      const res = await axios.post(
        "http://localhost:8001/api/chat/getOrCreateChatId",
        { user1Id, user2Id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChatId(res.data.data.id);
    } catch (err) {
      console.error("Failed to get or create chat:", err);
    }
  };

  // Load chat messages
  const loadMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:8001/api/message/get/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(res.data.data.reverse());
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // Handle selecting a user to chat with
  const openChatBox = async (user) => {
    setCurrentReceiver(user);
    await fetchOrCreateChat(loggedInUser.id, user.id);
  };

  // Handle message send
  const sendMessage = async () => {
    if (message.trim() === '') return;

    const payload = {
      chatId,
      senderId: loggedInUser.id,
      receiverId: currentReceiver.id,
      message,
    };

    socket.emit('sendMessage', payload);
    await axios.post("http://localhost:8001/api/message/send", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMessage('');
    loadMessages();
  };

  // Socket event listener
  useEffect(() => {
    socket.on("message", (data) => {
      if (
        (data.senderId === loggedInUser.id && data.receiverId === currentReceiver?.id) ||
        (data.senderId === currentReceiver?.id && data.receiverId === loggedInUser.id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });
  }, [loggedInUser, currentReceiver]);

  // Initial load
  useEffect(() => {
    fetchLoginUser();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId]);

  const handleLogout = () => {
    Navigate('/api/user/logOut')
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB');
  };

  const formatDateKey = (dateStr) => new Date(dateStr).toDateString();

  return (
    <div className="chat-container">
      {/* Left Panel */}
      <div className="left-side">
        <div className="user-list">
          <h1>Your Contact List:</h1>
          <ul>
            {users
              .filter((u) => u.id !== loggedInUser.id)
              .map((user) => (
                <li key={user.id} onClick={() => openChatBox(user)}>
                  {user.name}
                </li>
              ))}
          </ul>
        </div>
        <div>
          <div className="logged-in-user">
            <p><strong>Logged in as:</strong> <span>{loggedInUser.name}</span></p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-side">
        <div className="chat-header">
          <h2>Chat with {currentReceiver?.name || '...'}</h2>
        </div>

        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((msg, idx) => {
            const msgDate = formatDateKey(msg.created_at);
            const prevDate = idx > 0 ? formatDateKey(messages[idx - 1].created_at) : null;
            const showDate = msgDate !== prevDate;

            return (
              <React.Fragment key={msg.id || idx}>
                {showDate && (
                  <div className="date-divider">{msgDate}</div>
                )}
                <div className={`message ${msg.senderId === loggedInUser.id ? "sent" : "received"}`}>
                  <div className="message-content">
                    {msg.senderId === loggedInUser.id ? "you" : currentReceiver?.name}: {msg.message}
                    <div className="message-time">{formatTime(msg.created_at)}</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Wp;
