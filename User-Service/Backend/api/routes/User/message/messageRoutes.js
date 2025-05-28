const express = require("express");
const messageController = require("../../../controllers/user/message/messageController");
const checkUser = require("../../../middleware/checkUser");

const router = express.Router();

// Send a message
router.post("/send", checkUser, messageController.sendMessage);

// Get all messages between two users
// router.get("get/:chatId", checkUser, messageController.getMessages);

module.exports = router;
