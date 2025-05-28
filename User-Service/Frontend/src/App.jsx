import React, { useEffect, useState } from "react";
import { requestFCMToken } from './firebase';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './assets/components/Auth/SignUp';
import VerifyOTP from './assets/components/Auth/verifyOtp';
import Login from './assets/components/Auth/Login';
import Logout from './assets/components/Auth/LogOut';
import ChangePassword from './assets/components/Auth/ChangePassword';
import ForgotPassword from './assets/components/Auth/ForgotPassword';
import ResetPassword from "./assets/components/Auth/ResetPassword";

import Notification from './assets/components/Event/Notification';

import Dashboard from './assets/components/dashboard';
import EventDetails from "./assets/components/Event/Eventdetails";
import BookEvent from "./assets/components/Book/RegisterEvent";
import RegisterEvent from "./assets/components/Book/RegisterEvent";
import AllBookedEvents from "./assets/components/Book/AllBookedEvents";
import EventFeedback from "./assets/components/Event/feedback";
import Feedback from "./assets/components/Event/feedback";
import UserChat from "./assets/components/Chat/UserChat";

// import CreateEvent from './assets/components/Event/Create';
// import EventDetails from './assets/components/Event/Eventdetails';
// import UpdateEvent from './assets/components/Event/update';
// import Delete from './assets/components/Event/delete';

// import EventRequest from './assets/components/Book/EventRequest';

// import AcceptUser from './assets/components/Book/AcceptUser';
// import DeclineUser from './assets/components/Book/DeclineUser';
// import Chat from './assets/components/Chat/Chat';

const App = () => {
  const [fcmToken, setFcmToken] = useState("")
  console.log('fcmToken: ', fcmToken);

  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const token = await requestFCMToken();
        setFcmToken(token);
      } catch (error) {
        console.error('Error fetching FCM Token:', error);
      }
    };

    fetchFCMToken();
  }, []);


  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/signup" />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/verify-otp" element={<VerifyOTP />} />
          <Route path="/auth/login" element={<Login fcmToken={fcmToken} />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/forgot-password/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />
          <Route path="/auth/logout" element={<Logout />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/event/notifications" element={<Notification />} />
          <Route path="/event/event-details/:id" element={<EventDetails />} />
          <Route path="/event/chat/:id" element={<UserChat />} />
          <Route path="/event/feedback/:id" element={<Feedback />} />

          <Route path="/Book/event/:id" element={<RegisterEvent />} />
          <Route path="/Book/AllBookedEvents" element={<AllBookedEvents />} />


        </Routes>
      </Router>

    </div>
  )
}

export default App;




