const express = require("express");
const {
  registerCitizen,
  loginCitizen,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerCitizen);
router.post("/register", registerCitizen);
router.post("/login", loginCitizen);

module.exports = router;