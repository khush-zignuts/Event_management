const express = require("express");
const AdminAuthController = require("../../../controllers/admin/auth/AdminAuthController");
const checkAdmin = require("../../../middleware/checkAdmin");
const router = express.Router();

//auth User
router
  .post("/login", AdminAuthController.login)
  .post("/logOut", checkAdmin, AdminAuthController.logout);

module.exports = router;
