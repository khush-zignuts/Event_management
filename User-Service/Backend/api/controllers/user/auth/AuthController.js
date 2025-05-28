const VALIDATOR = require("validatorjs");
const {
  comparePassword,
  generateUUID,
  verifyOTP,
  hashPw,
} = require("../../../utils/utils");

const jwt = require("jsonwebtoken");
const {
  HTTP_STATUS_CODES,
  TOKEN_EXPIRY,
} = require("../../../../config/constant");
const { VALIDATION_RULES } = require("../../../../config/validationRules");

const { User } = require("../../../models/index");
const sendEmail = require("../../../helper/Mail/sendEmail");

const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = {
  signup: async (req, res) => {
    try {
      const { email, password, name, phoneNumber } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.USER.EMAIL,
        password: VALIDATION_RULES.USER.PASSWORD,
        name: VALIDATION_RULES.USER.NAME,
        phoneNumber: VALIDATION_RULES.USER.PHONE_NUMBER,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({
        where: { email, isDeleted: false, isActive: true },
        attributes: ["id"],
      });

      if (existingUser) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "User already exists.",
          data: "",
          error: "EMAIL_ALREADY_REGISTERED",
        });
      }

      const hashedPassword = await hashPw(password);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const otpCreated = Math.floor(Date.now() / 1000);
      const uuid = generateUUID();

      await User.create({
        id: uuid,
        email,
        password: hashedPassword,
        name,
        otp: otp,
        otpCreatedAt: otpCreated,
        phoneNumber: phoneNumber,
        createdAt: otpCreated,
        createdBy: uuid,
      });

      let otpStore = {};

      otpStore[email] = otp;

      // const templateData = {
      //   userName: name,
      //   otp: otp,
      //   appName: "Event Management",
      //   year: new Date().getFullYear(),
      // };

      // await sendEmail(
      //   email,
      //   "Verify Your Email - OTP",
      //   "../../assets/templates/otp-verification-email.hbs",
      //   templateData
      // );

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Signup successful. Please verify your email using OTP.",
        data: { email },
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: err.message,
      });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.USER.EMAIL,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const user = await User.findOne({
        where: { email, isDeleted: false, isActive: true },

        attributes: ["id", "otp", "otpCreatedAt"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "User not found.",
          data: "",
          error: "USER_NOT_FOUND",
        });
      }

      const isValid = verifyOTP(otp, user.otp, user.otpCreatedAt);

      if (!isValid) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Invalid OTP.",
          data: "",
          error: "INVALID_OTP",
        });
      }

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Email verified successfully!",
        data: "",
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: err.message,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, fcmToken } = req.body;
      console.log("req.body: ", req.body);

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.USER.EMAIL,
        password: VALIDATION_RULES.USER.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const user = await User.findOne({
        where: { email, isDeleted: false, isActive: true },
        attributes: ["id", "name", "email", "password", "accessToken"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "User not found.",
          data: "",
          error: "",
        });
      }

      const valid = await comparePassword(password, user.password);

      if (!valid) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Invalid credentials.",
          data: "",
          error: "",
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
      });

      user.accessToken = token;
      user.fcmToken = fcmToken;
      await user.save();

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Login successful.",
        data: { token, userId: user.id, username: user.name },
        error: "",
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: error.message,
      });
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findOne({
        where: { id: userId, isDeleted: false },
        attributes: ["id", "name", "accessToken"],
      });

      if (!user) {
        return res.json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "invalidCredentials",
          data: "",
          error: "",
        });
      }

      // Set accessToken to NULL (logout)
      await User.update(
        {
          accessToken: null,
          updatedAt: Math.floor(Date.now() / 1000),
          updatedBy: userId,
        },
        { where: { id: userId, isDeleted: false } }
      );
      return res.json({
        status: HTTP_STATUS_CODES.OK,
        message: "logout",
        data: "",
        error: "",
      });
    } catch (error) {
      return res.json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "serverError",
        data: "",
        error: error.message,
      });
    }
  },

  // Change Password
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const validation = new VALIDATOR(req.body, {
        currentPassword: VALIDATION_RULES.USER.PASSWORD,
        newPassword: VALIDATION_RULES.USER.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const user = await User.findOne({
        where: { id: userId, isDeleted: false },
        attributes: ["id", "password"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "user not found.",
          data: "",
          error: "USER_NOT_FOUND",
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODES.UNAUTHORIZED,
          message: "Current password is incorrect.",
          data: "",
          error: "INVALID_CURRENT_PASSWORD",
        });
      }

      const hashedNewPassword = await hashPw(newPassword);

      await User.update(
        { password: hashedNewPassword },
        { where: { id: user.id } }
      );

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Password updated successfully.",
        data: "",
        error: "",
      });
    } catch (error) {
      console.error("Change Password Error:", error.message);
      return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Server error.",
        data: "",
        error: "INTERNAL_SERVER_ERROR",
      });
    }
  },

  // Forgot Password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.USER.EMAIL,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      const user = await User.findOne({
        where: { email: email, isDeleted: false },
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "user not found.",
          data: "",
          error: "USER_NOT_FOUND",
        });
      }

      user.forgetPasswordToken = generateUUID();
      user.forgetPasswordTokenExpiry = Math.floor(
        (Date.now() + 15 * 60 * 1000) / 1000
      );
      // 15 min expiry
      await user.save();

      const templateData = {
        userName: user.name,
        email: user.email,
        resetLink: `http://localhost:5173/auth/forgot-password/reset-password/${user.forgetPasswordToken}`,
        appName: "Event Management",
        year: new Date().getFullYear(),
      };

      await sendEmail(
        email,
        "Reset Your Password",
        "../../../assets/templates/reset-password-email.hbs",
        templateData
      );

      console.log("\n Send email with reset link");

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Password reset link has been sent to your email.",
        data: { email },
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error",
        data: "",
        error: err.message,
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, token, newPassword, confirmPassword } = req.body;

      const validation = new VALIDATOR(req.body, {
        email: VALIDATION_RULES.USER.EMAIL,
        newPassword: VALIDATION_RULES.USER.PASSWORD,
        confirmPassword: VALIDATION_RULES.USER.PASSWORD,
      });

      if (validation.fails()) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Validation failed.",
          data: "",
          error: validation.errors.all(),
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "Passwords do not match.",
          data: "",
          error: "PASSWORD_MISMATCH",
        });
      }

      const user = await User.findOne({
        where: {
          email,
          forgetPasswordToken: token,
          forgetPasswordTokenExpiry: { [Op.gt]: Math.floor(Date.now() / 1000) },
        },
        attributes: ["id", "password"],
      });

      if (!user) {
        return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
          status: HTTP_STATUS_CODES.NOT_FOUND,
          message: "Invalid or expired token.",
          data: "",
          error: "TOKEN_INVALID_OR_EXPIRED",
        });
      }

      // Check if new password is the same as the old password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          status: HTTP_STATUS_CODES.BAD_REQUEST,
          message: "New password must be different from the old password.",
          data: "",
          error: "PASSWORD_SAME_AS_OLD",
        });
      }

      const hashedPassword = await hashPw(newPassword);

      await user.update({
        password: hashedPassword,
        forgetPasswordToken: null,
        forgetPasswordTokenExpiry: null,
      });

      return res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: "Password reset successful.",
        data: "",
        error: "",
      });
    } catch (err) {
      return res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.SERVER_ERROR,
        message: "Server error.",
        data: "",
        error: err.message,
      });
    }
  },
};
