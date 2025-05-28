const express = require("express");
const authController = require("../../../controllers/user/auth/authController");
const checkUser = require("../../../middleware/checkUser");
const router = express.Router();

router
  .post("/signup", authController.signup)
  .post("/verifyotp", authController.verifyOTP)
  .post("/login", authController.login)
  .post("/logout", checkUser, authController.logout)
  .post("/change-password", checkUser, authController.changePassword)
  .post("/forgot-password", authController.forgotPassword)
  .post("/reset-password", authController.resetPassword);

module.exports = router;
