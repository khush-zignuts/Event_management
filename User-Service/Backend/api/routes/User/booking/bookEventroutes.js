const express = require("express");

const bookEventController = require("../../../controllers/user/booking/BookEventController");

const checkUser = require("../../../middleware/checkUser");
const router = express.Router();

//booking create
router
  .post("/event/:id", checkUser, bookEventController.bookEvent)
  .get(
    "/getAllBookedEventsOrById",
    checkUser,
    bookEventController.getAllBookedEventsOrById
  );

module.exports = router;
