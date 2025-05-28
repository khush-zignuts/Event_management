import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const OrganizerChats = () => {
    const [chatBoxMessages, setChatBoxMessages] = useState([]);
    console.log('chatBoxMessages: ', chatBoxMessages);
    const [users, setUsers] = useState([]);

    const receiverRef = useRef('');
    const [receiver, setReceiver] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [message, setMessage] = useState("");

    const chatBoxRef = useRef(null);


    const token = localStorage.getItem("token");
    const organizerId = localStorage.getItem("organizerId");
    const organizerName = localStorage.getItem("organizerName");

    const data = {
        organizerId,
        organizerName,
    };

    // Sync receiverRef with receiver state

    useEffect(() => {

        if (!token) {
            alert('Please log in first.');
            navigator('/login');
            return null;
        }

        socket.emit("registeredOrganizer", data);

        const handleRegistered = (info) => {
            if (info) alert(info.message);
        };

        const handleMessage = (data) => {
            console.log('receiver data: ', data);
            const isOrganizer = data.senderId === organizerId;
            const newMessage = {
                sender: isOrganizer ? 'you' : data.senderId,
                message: data.message,
            };


            setChatBoxMessages((prev) => [...prev, newMessage]);


            setTimeout(() => {
                if (chatBoxRef.current) {
                    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                }
            }, 100);
        };


        socket.on("registered", handleRegistered);
        socket.on("message", handleMessage);

        fetchUsers();

        return () => {
            socket.off("registered", handleRegistered);
            socket.off("message", handleMessage);
        };
    }, []);


    const fetchUsers = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5001/api/organizer/chat/getAllUsersForOrganizer",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUsers(res.data.data.users);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        }
    };

    // const openChat = async (data, user) => {
    //     try {
    //         const res = await axios.post(
    //             "http://localhost:5000/api/organizer/chat/getOrCreateChatId",
    //             {
    //                 user1Id: data.organizerId,
    //                 user2Id: user.userId,
    //                 eventId: user.eventId,
    //             },
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );

    //         const chat = res.data.data.id;
    //         setChatId(chat);
    //         setReceiver(user);
    //         receiverRef.current = res.user;
    //         setChatBoxMessages([]); // Clear previous messages when opening a new chat
    //         scrollToBottom();
    //     } catch (err) {
    //         console.error("Failed to open chat:", err);
    //     }
    // };

    const openChat = async (data, user) => {
        try {
            const res = await axios.post(

                "http://localhost:5000/api/organizer/chat/getOrCreateChatId",
                {
                    user1Id: data.organizerId,
                    user2Id: user.userId,
                    eventId: user.eventId,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const chatId = res.data.data.id;
            console.log('cchatIdhat: ', chatId);
            setChatId(chatId);
            setReceiver(user);
            receiverRef.current = res.user;

            // Fetch previous messages for this chat from backend

            const messagesRes = await axios.get(
                `http://localhost:5000/api/organizer/message/get/${chatId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log('messagesRes: ', messagesRes);
            const previousMessages = messagesRes.data.data.map(msg => ({
                sender: msg.senderId === data.organizerId ? "you" : user.userName,
                message: msg.content,
            }));

            setChatBoxMessages(previousMessages.reverse());  // Reverse to show oldest first

            scrollToBottom();
        } catch (err) {
            console.error("Failed to open chat or fetch messages:", err);
        }
    };



    const sendMessage = async (data) => {
        if (!message.trim() || !receiver) return;

        const msgData = {
            chatId,
            senderId: data.organizerId,
            receiverId: receiver.userId,
            message,
            eventId: receiver.eventId,
        };

        try {
            await axios.post(
                "http://localhost:5000/api/organizer/message/send",
                msgData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Optimistically add the message
            setChatBoxMessages((prev) => [
                ...prev,
                { sender: "you", message },
            ]);

        } catch (err) {
            console.error("Failed to send message:", err);
        }

        setMessage("");
    };

    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <h3>Your Users:</h3>
                <ul style={styles.userList}>
                    {Object.entries(
                        users.reduce((acc, user) => {
                            if (!acc[user.eventName]) acc[user.eventName] = [];
                            acc[user.eventName].push(user);
                            return acc;
                        }, {})
                    ).map(([eventName, eventUsers]) => (
                        <li key={eventName}>
                            <strong>{eventName}</strong>
                            <ul>
                                {[...new Map(eventUsers.map((u) => [u.userId, u])).values()].map(
                                    (user) => (
                                        <li
                                            key={user.userId}
                                            style={styles.userItem}
                                            onClick={() => openChat(data, user)}
                                        >
                                            {user.userName}
                                        </li>
                                    )
                                )}
                            </ul>
                        </li>
                    ))}
                </ul>

                {organizerName && (
                    <div style={styles.loggedInUser}>
                        <p>
                            <strong>Organizer:</strong> {organizerName}
                        </p>
                        <button
                            style={styles.backBtn}
                            onClick={() => (window.location.href = "/dashboard")}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>

            <div style={styles.chatArea}>
                {receiver ? (
                    <>
                        <div style={styles.chatHeader}>
                            <h4>Chat with {receiver.userName}</h4>
                        </div>
                        <div style={styles.chatBox} ref={chatBoxRef}>
                            {chatBoxMessages.map((msg, index) => (
                                <div key={index}>
                                    <strong>{msg.sender === 'you' ? 'You' : receiver?.userName || msg.sender}:</strong> {msg.message}
                                </div>

                            ))}
                        </div>
                        <div style={styles.inputArea}>
                            <input
                                type="text"
                                placeholder="Type a message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={styles.input}
                            />
                            <button onClick={() => sendMessage(data)} style={styles.sendBtn}>
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p style={{ padding: "20px" }}>Select a user to start chatting.</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        height: "90vh",
        width: "95%",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
    },
    sidebar: {
        width: "25%",
        borderRight: "1px solid #ccc",
        padding: "15px",
        backgroundColor: "#f9f9f9",
    },
    userList: {
        listStyle: "none",
        padding: 0,
        marginTop: "10px",
        overflowY: "auto",
        maxHeight: "65vh",
    },
    userItem: {
        padding: "10px",
        marginBottom: "5px",
        cursor: "pointer",
        borderBottom: "1px solid #ddd",
    },
    loggedInUser: {
        marginTop: "20px",
        fontSize: "14px",
        color: "#555",
    },
    chatArea: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    chatHeader: {
        padding: "10px",
        borderBottom: "1px solid #ccc",
        backgroundColor: "#f5f5f5",
    },
    chatBox: {
        flex: 1,
        padding: "10px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
    },
    message: {
        maxWidth: "60%",
        padding: "8px 12px",
        margin: "4px 0",
        borderRadius: "16px",
        fontSize: "14px",
    },
    inputArea: {
        display: "flex",
        padding: "10px",
        borderTop: "1px solid #ccc",
        backgroundColor: "#f5f5f5",
    },
    input: {
        flex: 1,
        padding: "8px",
        fontSize: "14px",
        border: "1px solid #ccc",
        borderRadius: "20px",
        marginRight: "10px",
    },
    sendBtn: {
        padding: "8px 16px",
        fontSize: "14px",
        borderRadius: "20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        cursor: "pointer",
    },
    backBtn: {
        marginTop: "10px",
        padding: "6px 12px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "#007bff",
        color: "#fff",
        cursor: "pointer",
    },
};

export default OrganizerChats;
