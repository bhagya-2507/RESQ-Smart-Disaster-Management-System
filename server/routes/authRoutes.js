
const express = require("express");

const {
  registerCitizen,
  loginCitizen,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerCitizen);
router.post("/login", loginCitizen);

// Citizen forgot and reset password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;