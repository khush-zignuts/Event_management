importScripts("https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.9/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyB7bDqb1wJ76eDIStGE7KS29wTozZ29fjs",
  authDomain: "eventmanagement-aa36a.firebaseapp.com",
  projectId: "eventmanagement-aa36a",
  storageBucket: "eventmanagement-aa36a.firebasestorage.app",
  messagingSenderId: "491444906584",
  appId: "1:491444906584:web:123d4ef73d0bd506a9382d",
  measurementId: "G-TRE8SP46JN",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle =
    payload.notification?.title || "New Event Notification";
  const notificationOptions = {
    body: payload.notification?.body || "An event update is available.",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
