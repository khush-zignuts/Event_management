const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const { CommonFields, commonOptions } = require("./CommanFields");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
      field: "phone_number",
    },
    accessToken: {
      type: DataTypes.TEXT,
      field: "access_token",
      allowNull: true,
    },
    fcmToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "fcm_token",
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    otpCreatedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: "otp_created_at",
    },
    forgetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "forgot_password_token",
    },
    forgetPasswordTokenExpiry: {
      type: DataTypes.BIGINT, // store Unix timestamp (in seconds)
      field: "forgot_password_token_expiry",
      allowNull: true,
    },

    ...CommonFields,
  },
  {
    tableName: "user",
    freezeTableName: true,
    ...commonOptions,
  }
);

module.exports = User;
