const express = require("express");
const router = express.Router();
const authRoutes = require("./auth/authRoutes");
const eventRoutes = require("./event/eventRoutes");
const bookEventRoutes = require("./booking/bookEventroutes");
const chatRoutes = require("./chat/chatRoutes");
const messageRoutes = require("./message/messageRoutes");

//authentication

router.use("/auth", authRoutes);

//event
router.use("/event", eventRoutes);

//booking
router.use("/book", bookEventRoutes);

//chat Routes
router.use("/chat", chatRoutes);

//message Routes
router.use("/message", messageRoutes);

//organizer

module.exports = router;
