const express = require("express");

const chatController = require("../../../controllers/organizer/chat/chatController");
const checkOrganizer = require("../../../middleware/checkOrganizer");
const router = express.Router();

//booking create
router.post("/getOrCreateChatId", checkOrganizer, chatController.getorcreate);
router.get(
  "/getAllUsersForOrganizer",
  checkOrganizer,
  chatController.getAllUsersForOrganizer
);

module.exports = router;
