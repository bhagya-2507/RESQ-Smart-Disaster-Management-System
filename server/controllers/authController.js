const bcrypt = require("bcryptjs");
const Citizen = require("../models/citizen");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const registerCitizen = async (req, res) => {
  try {
    const {
      full_name,
      email,
      mobile,
      password,
      state,
      city,
    } = req.body;

    // Required fields
    if (
      !full_name ||
      !email ||
      !mobile ||
      !password ||
      !state ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Name validation
    if (full_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Mobile validation
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must contain exactly 10 digits.",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain an uppercase letter.",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain a lowercase letter.",
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain a number.",
      });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain a special character.",
      });
    }

    // Check existing citizen
    const existingCitizen = await Citizen.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingCitizen) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create citizen
    const citizen = await Citizen.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      mobile,
      password_hash,
      state: state.trim(),
      city: city.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Citizen registered successfully.",
      user: {
        id: citizen._id,
        full_name: citizen.full_name,
        email: citizen.email,
        mobile: citizen.mobile,
        state: citizen.state,
        city: citizen.city,
        role: "citizen",
      },
    });
  } catch (error) {
    console.error("Citizen registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};
const jwt = require("jsonwebtoken");

const loginCitizen = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const citizen = await Citizen.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!citizen) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (citizen.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      citizen.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: citizen._id,
        role: "citizen",
        email: citizen.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: citizen._id,
        full_name: citizen.full_name,
        email: citizen.email,
        mobile: citizen.mobile,
        state: citizen.state,
        city: citizen.city,
        role: "citizen",
      },
    });
  } catch (error) {
    console.error("Citizen login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const citizen = await Citizen.findOne({ email });

    // Same response prevents revealing whether an email is registered.
    if (!citizen) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP will be sent.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    citizen.reset_otp_hash = await bcrypt.hash(otp, 10);
    citizen.reset_otp_expires = new Date(Date.now() + 10 * 60 * 1000);

    await citizen.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: citizen.email,
        subject: "RESQ - Password Reset OTP",
        text: `Your RESQ password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
      });
    } catch (emailError) {
      citizen.reset_otp_hash = null;
      citizen.reset_otp_expires = null;
      await citizen.save();
      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message: "If this email is registered, an OTP will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to send OTP right now. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP.",
      });
    }

    // Match the password rules used during registration
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[!@#$%^&*]/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8+ characters and include uppercase, lowercase, number and special character.",
      });
    }

    const citizen = await Citizen.findOne({ email });

    if (
      !citizen ||
      !citizen.reset_otp_hash ||
      !citizen.reset_otp_expires ||
      citizen.reset_otp_expires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired. Please request a new OTP.",
      });
    }

    const otpMatches = await bcrypt.compare(
      otp,
      citizen.reset_otp_hash
    );

    if (!otpMatches) {
      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please try again.",
      });
    }

    citizen.password_hash = await bcrypt.hash(newPassword, 12);
    citizen.reset_otp_hash = null;
    citizen.reset_otp_expires = null;

    await citizen.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password right now. Please try again.",
    });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  forgotPassword,
  resetPassword,
};