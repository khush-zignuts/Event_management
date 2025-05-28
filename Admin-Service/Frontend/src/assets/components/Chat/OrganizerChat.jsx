// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import io from 'socket.io-client';
// import axios from 'axios';

// const socket = io('http://localhost:5000');

// const OrganizerChat = () => {
//   const { id: eventId } = useParams();
//   console.log('eventId: ', eventId);
//   let organizerId = localStorage.getItem('organizerId');
//   const [chatBoxMessages, setChatBoxMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState('');
//   const [organizerName, setOrganizerName] = useState('');
//   const [senderChatId, setSenderChatId] = useState(null);


//   const chatBoxRef = useRef(null);
//   const navigate = useNavigate();

//   const data = { organizerId, eventId };
//   console.log('data: ', data);
//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     if (!token) {
//       alert('Please log in first.');
//       navigate('/login');
//       return;
//     }

//     socket.emit('registeredUser', data);

//     socket.on('registered', (res) => {
//       setOrganizerName(res.organizerName);
//       setOrganizerId(res.organizerId);
//       openChatBox(res.organizerId);
//     });

//     socket.on('message', (data) => {
//       const isUser = data.senderId === userId;
//       const newMessage = {
//         sender: isUser ? 'you' : organizerName,
//         message: data.message,
//       };
//       setChatBoxMessages((prev) => [...prev, newMessage]);
//       setTimeout(() => {
//         chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
//       }, 100);
//     });

//     return () => {
//       socket.off('registered');
//       socket.off('message');
//     };
//   }, [eventId]);

//   const openChatBox = async (organizerId) => {
//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/user/chat/getOrCreateChatId',
//         { user1Id: userId, user2Id: organizerId, eventId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSenderChatId(res.data.data);
//     } catch (error) {
//       console.error('Failed to get or create chat:', error);
//       alert('Unable to start chat with organizer.');
//     }
//   };

//   const sendMessage = async () => {
//     if (!messageInput.trim()) return;

//     const payload = {
//       chatId: senderChatId,
//       senderId: userId,
//       receiverId: organizerId,
//       eventId,
//       message: messageInput,
//     };

//     try {
//       await axios.post(
//         'http://localhost:5000/api/user/message/send',
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (error) {
//       console.error('Failed to send message:', error);
//     }

//     setMessageInput('');
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.chatContainer}>
//         <div style={styles.mainBox}>
//           <div style={styles.chatHeader}>
//             <h2>Chat with {organizerName || 'Organizer'}</h2>
//           </div>
//           <div style={styles.chatBox} ref={chatBoxRef}>
//             {chatBoxMessages.map((msg, idx) => (
//               <div key={idx} style={styles.messageBubble}>
//                 <strong>{msg.sender}:</strong> {msg.message}
//               </div>
//             ))}
//           </div>
//           <div style={styles.inputArea}>
//             <input
//               type="text"
//               value={messageInput}
//               onChange={(e) => setMessageInput(e.target.value)}
//               placeholder="Type a message..."
//               style={styles.input}
//             />
//             <button onClick={sendMessage} style={styles.sendButton}>
//               Send
//             </button>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     height: '100vh',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f4f4f4',
//     fontFamily: 'Arial, sans-serif',
//   },
//   chatContainer: {
//     width: '400px',
//     backgroundColor: 'white',
//     border: '1px solid #ccc',
//     borderRadius: '8px',
//     overflow: 'hidden',
//     boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//   },
//   mainBox: {
//     display: 'flex',
//     flexDirection: 'column',
//     height: '500px',
//   },
//   chatHeader: {
//     backgroundColor: '#007bff',
//     color: 'white',
//     padding: '15px',
//     textAlign: 'center',
//     fontSize: '18px',
//     fontWeight: 'bold',
//   },
//   chatBox: {
//     flex: 1,
//     padding: '10px',
//     overflowY: 'auto',
//     backgroundColor: '#f9f9f9',
//   },
//   messageBubble: {
//     marginBottom: '10px',
//     padding: '8px',
//     backgroundColor: '#e1f5fe',
//     borderRadius: '5px',
//     maxWidth: '80%',
//   },
//   inputArea: {
//     display: 'flex',
//     padding: '10px',
//     borderTop: '1px solid #ccc',
//   },
//   input: {
//     flex: 1,
//     padding: '10px',
//     border: '1px solid #ccc',
//     borderRadius: '5px',
//   },
//   sendButton: {
//     marginLeft: '10px',
//     padding: '10px 15px',
//     backgroundColor: '#007bff',
//     color: 'white',
//     border: 'none',
//     borderRadius: '5px',
//     cursor: 'pointer',
//   },
// };

// export default OrganizerChat;
