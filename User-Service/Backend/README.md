**User-Service** of the real-time event management system:

---

# User-Service – Event Management System

This is the **User-Service** of a real-time event management system built using **Node.js**, **Express**, **Sequelize (PostgreSQL)**, and **Socket.IO**. It supports user authentication, event booking, chat with organizers, notifications (email + push), and more.

---

## 📁 Project Structure

```
User-Service/
├─ api/
│  ├─ controllers/
│  │  ├─ organizer/
│  │  │  ├─ chat/
│  │  │  │  └─ ChatController.js
│  │  │  ├─ message/
│  │  │  │  └─ MessageController.js
│  │  │  └─ index.js
│  │  ├─ user/
│  │  │  ├─ auth/
│  │  │  │  └─ AuthController.js
│  │  │  ├─ booking/
│  │  │  │  └─ BookEventController.js
│  │  │  ├─ chat/
│  │  │  │  └─ chatController.js
│  │  │  ├─ event/
│  │  │  │  └─ EventController.js
│  │  │  ├─ message/
│  │  │  │  └─ MessageController.js
│  │  │  └─ index.js
│  │  └─ index.js
│  ├─ helper/
│  │  └─ sendEmail.js
│  ├─ middleware/
│  │  ├─ checkOrganizer.js
│  │  └─ checkUser.js
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
│  │  ├─ Organizer/
│  │  │  ├─ chat/
│  │  │  │  └─ chatRoutes.js
│  │  │  ├─ message/
│  │  │  │  └─ messageRoutes.js
│  │  │  └─ index.js
│  │  ├─ User/
│  │  │  ├─ auth/
│  │  │  │  └─ authRoutes.js
│  │  │  ├─ booking/
│  │  │  │  └─ bookEventroutes.js
│  │  │  ├─ chat/
│  │  │  │  └─ chatRoutes.js
│  │  │  ├─ event/
│  │  │  │  └─ eventRoutes.js
│  │  │  ├─ message/
│  │  │  │  └─ messageRoutes.js
│  │  │  └─ index.js
│  │  └─ index.js
│  └─ utils/
│     ├─ comparePassword.js
│     ├─ generateUUID.js
│     ├─ hashpw.js
│     └─ verifyOtp.js
├─ assets/
│  └─ templates/
│     └─ otp-verification-email.hbs
├─ config/
│  ├─ constant.js
│  ├─ data.json
│  ├─ db.js
│  ├─ socketIo.js
│  └─ validationRules.js
├─ .env
├─ .gitignore
├─ package-lock.json
├─ package.json
├─ server.js
└─ temp.js

```

---

## ⚙️ Features

### 👤 User Features
- Sign-up and login with OTP email verification
- View and book events
- Real-time chat with organizers using Socket.IO
- Receive push notifications (via Firebase Cloud Messaging)
- Get event reminders and email updates
- View booking history and feedback

### 🎤 Organizer Features (from user-side interaction)
- Real-time chat with users
- Manage message communication
- View user feedback and bookings (via integration with organizer-service)

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via Sequelize)
- **Real-Time:** Socket.IO
- **Authentication:** JWT, OTP (Email)
- **Notifications:** Firebase Cloud Messaging, Nodemailer (with Handlebars template)
- **Scheduling:** node-cron (for reminders/emails)
- **Caching (optional):** Redis (can be added)

---

## 🔐 Environment Variables (`.env`)

```env
PORT=3000
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
git clone https://github.com/your-repo/user-service.git
cd user-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the root with the above variables.

### 4. Initialize database

Ensure PostgreSQL is running and configured. Then:

```bash
npx sequelize-cli db:migrate
```


### 5. Start the server

```bash
npm start
```

---

## 🔌 API Endpoints (Overview)

| Method | Route                          | Description                       |
|--------|--------------------------------|-----------------------------------|
| POST   | `/api/user/auth/register`      | User registration with OTP        |
| POST   | `/api/user/auth/login`         | Login with email & password       |
| GET    | `/api/user/event/list`         | View all events                   |
| POST   | `/api/user/booking/book`       | Book an event                     |
| POST   | `/api/user/chat/initiate`      | Start a chat                      |
| POST   | `/api/user/message/send`       | Send a message                    |
| GET    | `/api/user/notification/all`   | Fetch user notifications          |

Full documentation is under development (Postman collection available soon).

---

## 💬 Socket.IO Events

### User ↔ Organizer Messaging:

- `user:sendMessage`
- `organizer:receiveMessage`
- `user:typing`
- `organizer:seen`

Socket connection is initialized in `/config/socketIo.js`.

---

## ✉️ Email Template

The `otp-verification-email.hbs` file under `assets/templates` is used for sending OTPs.

You can customize the layout and branding as needed.


```

---

Would you like a matching `README.md` for the **Organizer-Service** as well?
