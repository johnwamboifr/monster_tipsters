import bcryptjs from "bcryptjs";
import CryptoJS from "crypto-js";
import { Op } from "sequelize";
import db from "../models/index.js";
import generateOtp from "../utils/otpGenerator.js";
import generateAuthToken from "../utils/generateAuthToken.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
} from "../brevo/email.brevo.js";

const { Users } = db;

export const signup = async (req, res) => {
  try {
    let { email, name, password, phoneNumber } = req.body;

    email = email.toLowerCase();

    const errors = [];
    if (!email) errors.push("Please fill in email!");
    if (!name) errors.push("Please fill in name!");
    if (!phoneNumber) errors.push("Please fill in phone number!");
    if (!password) errors.push("Please fill in password!");

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please use a valid email!" });
    }

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "This email is already in use." });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const verificationCode = generateOtp();
    const verificationCodeExpiresAt = Date.now() + 3600000;
    const user = await Users.create({
      email,
      name,
      phoneNumber,
      verificationCodeExpiresAt,
      verificationCode,
      password: hashPassword,
      verified: false,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { userId: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Please fill in email and password!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: false, message: "Please use a valid email!" });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: false, message: "Email doesn't exist" });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ status: false, message: "Wrong password." });
    }

    const userAgent = req.get("User-Agent") || null;
    const lastLoginIp = (req.headers["x-forwarded-for"] || req.ip || null)
      .toString()
      .split(",")[0]
      .trim();
    const lastLoginAt = new Date();

    await user.update({
      lastLoginAt,
      lastLoginIp,
      lastLoginUserAgent: userAgent,
    });

    const userToken = generateAuthToken(user);
    res.status(200).json({ message: "Login success", token: userToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetCode = generateOtp();
    const resetCodeExpires = Date.now() + 3600000;

    user.resetToken = resetCode;
    user.resetTokenExpires = resetCodeExpires;
    await user.save();

    sendPasswordResetEmail(email, resetCode);

    res.status(200).json({ success: true, message: "Password reset code sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    const user = await Users.findOne({ where: { verificationCode } });
    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired verification code",
      });
    }

    if (user.verificationCodeExpiresAt < Date.now()) {
      return res.status(400).json({ status: false, message: "Verification code has expired" });
    }

    user.verified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({ status: true, message: "Account successfully verified" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, resetCode, password } = req.body;

    if (!email || !resetCode || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code, and new password are required",
      });
    }

    const user = await Users.findOne({
      where: {
        email,
        resetToken: resetCode,
        resetTokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });

    await sendResetSuccessEmail(user.email);

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        name: user.name,
        phoneNumber: user.phoneNumber,
        accessExpiration: user.accessExpiration,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  login,
  signup,
  verifyAccount,
  changePassword,
  forgotPassword,
  refreshToken,
};
