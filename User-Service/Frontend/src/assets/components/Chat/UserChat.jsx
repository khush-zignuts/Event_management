import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const UserChat = () => {
    const { id: eventId } = useParams();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [chatBoxMessages, setChatBoxMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const organizerNameRef = useRef('');

    const [organizerName, setOrganizerName] = useState('');
    const [organizerId, setOrganizerId] = useState('');
    const [userName, setuserName] = useState('');
    const [senderChatId, setSenderChatId] = useState(null);
    const chatBoxRef = useRef(null);

    const data = {
        userId,
        eventId,
    };


    useEffect(() => {
        if (!token) {
            alert('Please log in first.');
            navigate('/login');
            return null;
        }

        socket.emit('registeredUser', data);

        const handleRegistered = (res) => {
            const organizerid = res.organizerId;
            alert(res.message);
            setOrganizerName(res.organizerName);
            organizerNameRef.current = res.organizerName;
            setOrganizerId(organizerid);
            setuserName(res.userName);

            openChatBox({ ...data, organizerId: organizerid });
        };

        const handleMessage = (info) => {
            const isUser = info.senderId === data.userId;
            const newMessage = {
                sender: isUser ? 'you' : organizerNameRef.current,
                message: info.message,
            };
            setChatBoxMessages((prev) => [...prev, newMessage]);

            setTimeout(() => {
                if (chatBoxRef.current) {
                    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                }
            }, 100);
        };

        socket.on('registered', handleRegistered);
        socket.on('message', handleMessage);

        return () => {
            socket.off('registered', handleRegistered);
            socket.off('message', handleMessage);
        };
    }, []);


    const openChatBox = async ({ userId, eventId, organizerId }) => {
        try {
            const res = await axios.post(
                'http://localhost:5000/api/user/chat/getOrCreateChatId',
                {
                    user1Id: userId,
                    user2Id: organizerId,
                    eventId: eventId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('res.data.data: ', res.data.data);
            setSenderChatId(res.data.data);

            scrollToBottom();
        } catch (error) {
            console.error('Failed to get or create chat:', error);
            alert('Unable to start chat with user.');
        }
    };

    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    };

    const sendMessage = async () => {
        if (messageInput.trim() === '') return;

        const messagePayload = {
            chatId: senderChatId,
            senderId: data.userId,
            receiverId: organizerId,
            eventId: data.eventId,
            message: messageInput,
        };

        try {
            await axios.post(
                'http://localhost:5000/api/user/message/send',
                messagePayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Failed to send message to server:', error);
        }

        setMessageInput('');
    };

    return (
        <div style={styles.container}>
            <div style={styles.chatContainer}>
                <div style={styles.mainBox}>
                    <div style={styles.chatHeader}>
                        <h2>Chat with {organizerName}</h2>
                    </div>

                    <div style={styles.chatBox} ref={chatBoxRef}>
                        {chatBoxMessages.map((msg, idx) => (
                            <div key={idx} style={styles.messageBubble}>
                                {msg.sender}: {msg.message}
                            </div>
                        ))}
                    </div>

                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."

                        />
                        <button onClick={() => sendMessage()}  >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        fontFamily: 'Arial, sans-serif',
    },
    chatContainer: {
        width: '400px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    mainBox: {
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
    },
    chatHeader: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    chatBox: {
        flex: 1,
        padding: '10px',
        overflowY: 'auto',
        backgroundColor: '#f9f9f9',
    },
    messageBubble: {
        marginBottom: '10px',
        padding: '8px',
        backgroundColor: '#e1f5fe',
        borderRadius: '5px',
        maxWidth: '80%',
    },
    inputArea: {
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #ccc',
    },
    input: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    sendButton: {
        marginLeft: '10px',
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default UserChat;
