const express = require("express");
const router = express.Router();
const organizerRoutes = require("./organizer/index");
const userRoutes = require("./user/index");

//admin Routes
router.use("/user", userRoutes);
//organizer
router.use("/organizer", organizerRoutes);

module.exports = router;
