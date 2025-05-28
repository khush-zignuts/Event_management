// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB7bDqb1wJ76eDIStGE7KS29wTozZ29fjs",
  authDomain: "eventmanagement-aa36a.firebaseapp.com",
  projectId: "eventmanagement-aa36a",
  storageBucket: "eventmanagement-aa36a.firebasestorage.app",
  messagingSenderId: "491444906584",
  appId: "1:491444906584:web:123d4ef73d0bd506a9382d",
  measurementId: "G-TRE8SP46JN",
};

const vapidKey =
  "BCbG0VBa8sugqayaF25cfdRZSPn06DUvgCPa9cDZT9bCf-tdiECrTaZR7Fr-E8dEfwtU7QzM-w2BIKzE20RA-dM";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Get Messaging instance
const messaging = getMessaging(app);

// Function to request FCM Token
export const requestFCMToken = async () => {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    console.error(
      "This browser does not support the necessary APIs for Firebase Messaging."
    );
    return null;
  }

  return new Promise((resolve, reject) => {
    Notification.requestPermission()
      .then(async (permission) => {
        if (permission !== "granted") {
          console.error("Notification permission not granted by the user.");
          resolve(null);
          return;
        }

        try {
          const currentToken = await getToken(messaging, { vapidKey });
          if (currentToken) {
            resolve(currentToken);
          } else {
            console.warn(
              "No FCM token retrieved. Ensure the app is properly configured."
            );
            resolve(null);
          }
        } catch (error) {
          console.error(
            "An error occurred while retrieving the FCM token:",
            error
          );
          resolve(null);
        }
      })
      .catch((error) => {
        console.error(
          "An error occurred while requesting notification permission:",
          error
        );
        resolve(null);
      });
  });
};

export const onMessageListener = () => {
  return new Promise((resolve, reject) => {
    onMessage(
      messaging,
      (payload) => {
        resolve(payload);
      },
      (error) => {
        reject(error);
      }
    );
  });
};
