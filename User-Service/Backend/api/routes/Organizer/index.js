const express = require("express");
const router = express.Router();

const chatRoutes = require("./chat/chatRoutes");
const messageRoutes = require("./message/messageRoutes");

//chat Routes
router.use("/chat", chatRoutes);

//message Routes
router.use("/message", messageRoutes);

//organizer

module.exports = router;
