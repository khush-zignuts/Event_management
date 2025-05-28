 ---

# 🎯 Organizer-Service – Real-Time Event Management System

This is the **Organizer-Service** of a real-time event management platform powered by **Node.js**, **Express**, **Sequelize (PostgreSQL)**, and **Socket.IO**. Organizers can create events, manage bookings, chat with users, send notifications, and more.

---

## 📁 Project Structure

```
Organizer-Service/
├─ api/
│  ├─ controllers/
│  │  ├─ auth/
│  │  │  └─ AuthController.js
│  │  ├─ booking/
│  │  │  └─ BookEventController.js
│  │  ├─ chat/
│  │  │  └─ ChatController.js
│  │  ├─ event/
│  │  │  └─ EventController.js
│  │  ├─ message/
│  │  │  └─ MessageController.js
│  │  └─ index.js
│  ├─ helper/
│  │  ├─ sendEmail.js
│  │  ├─ sendNotification.js
│  │  └─ sendPushNotification.js
│  ├─ middleware/
│  │  └─ checkOrganizer.js
│  ├─ models/
│  │  ├─ Booking.js
│  │  ├─ Chat.js
│  │  ├─ CommanFields.js
│  │  ├─ EmailQueue.js
│  │  ├─ Event.js
│  │  ├─ EventFeedback.js
│  │  ├─ index.js
│  │  ├─ Message.js
│  │  ├─ Notification.js
│  │  ├─ Organizer.js
│  │  ├─ SocketIO.js
│  │  └─ User.js
│  ├─ public/
│  │  ├─ chat.html
│  │  └─ login.html
│  ├─ routes/
│  │  ├─ auth/
│  │  │  └─ authRoutes.js
│  │  ├─ book/
│  │  │  └─ bookEventRoutes.js
│  │  ├─ chat/
│  │  │  └─ chatRoutes.js
│  │  ├─ event/
│  │  │  └─ eventRoutes.js
│  │  ├─ message/
│  │  │  └─ messageRoutes.js
│  │  └─ index.js
│  └─ utils/
│     ├─ comparePassword.js
│     ├─ generateUUID.js
│     ├─ hashPw.js
│     └─ verifyOtp.js
├─ assets/
│  └─ templates/
│     ├─ event-reminder-email.hbs
│     └─ otp-verification-email.hbs
├─ config/
│  ├─ constant.js
│  ├─ data.json
│  ├─ db.js
│  ├─ firebase.js
│  ├─ socketIO.js
│  └─ validationRules.js
├─ .env
├─ .gitignore
├─ package-lock.json
├─ package.json
├─ server.js
└─ temp.js
```

---

## ✅ Features

### 🎯 Organizer Functionalities

* Secure login with JWT & OTP
* Create and manage events
* Book events on behalf of users
* Real-time chat with users via Socket.IO
* Send push notifications (Firebase Cloud Messaging)
* Email alerts using Handlebars + Nodemailer
* View and manage user feedback

### 🔧 System-Wide

* Sequelize ORM with PostgreSQL
* Modular MVC architecture
* Public views served from `/public` (e.g., login, chat)
* Email templates for OTP and event notifications
* Cron jobs for event reminders (if applicable)

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL via Sequelize
* **Authentication:** JWT, Email OTP
* **Real-Time:** Socket.IO
* **Notifications:** Firebase Cloud Messaging, Nodemailer
* **Templating:** Handlebars
* **Cron Jobs:** node-cron (if reminders are enabled)

---

## 🔐 Environment Variables (`.env`)

```env
PORT=4000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FCM_SERVER_KEY=your_firebase_server_key
```

---

## 🚀 Setup & Run

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/organizer-service.git
cd organizer-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure `.env`

Create a `.env` file in the root directory and populate it with your environment variables as shown above.

### 4. Migrate the database

Make sure PostgreSQL is running:

```bash
npx sequelize-cli db:migrate
```

### 5. Start the server

```bash
npm start
```

---

## 📬 Email Templates

Located in `assets/templates/`:

* `otp-verification-email.hbs`
* `event-reminder-email.hbs`

Customizable using [Handlebars](https://handlebarsjs.com/).

---

## 🧠 API Endpoints (Overview)

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| POST   | `/api/auth/login`   | Organizer login             |
| POST   | `/api/event`        | Create a new event          |
| GET    | `/api/event/list`   | Get list of created events  |
| POST   | `/api/book/event`   | Book event for user         |
| GET    | `/api/chat`         | Retrieve chat history       |
| POST   | `/api/message/send` | Send a message in real-time |

---

## 📡 Socket.IO Events

* `organizer:sendMessage`
* `user:receiveMessage`
* `organizer:typing`
* `user:seen`

Socket.IO is configured in `/config/socketIO.js`.

---

## 🔔 Firebase Push Notifications

1. Setup Firebase Project
2. Add keys to `.env`
3. Use `sendPushNotification.js` for dispatching messages
4. Service Worker (`firebase-messaging-sw.js`) can be included in `/public` for frontend testing

---

## ✨ Optional: Frontend Integration

* The Organizer-Service APIs can be consumed by a frontend app built with **React + Vite**
* Includes real-time messaging, event management dashboards, and notifications
* For push notifications, ensure service worker registration and permission handling

---

## 📦 Sample Workflow

1. Organizer logs in with OTP.
2. Creates an event.
3. Users can view/book events (via User-Service).
4. Organizer can chat with booked users.
5. Organizer sends real-time notifications and emails.
6. Cron jobs trigger event reminders.

---
 
