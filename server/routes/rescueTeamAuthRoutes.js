const express = require("express");

const {
  loginRescueTeam,
} = require("../controllers/rescueTeamAuthController");

const router = express.Router();

router.post("/login", loginRescueTeam);

module.exports = router;