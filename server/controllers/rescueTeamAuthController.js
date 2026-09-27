const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const RescueTeamUser = require("../models/RescueTeamUser");
const RescueTeam = require("../models/RescueTeam");

const loginRescueTeam = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const normalizedUsername = username.trim().toUpperCase();

const teamUser = await RescueTeamUser.findOne({
  username: normalizedUsername,
});

    if (!teamUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid team credentials.",
      });
    }

    if (teamUser.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "This rescue team account is inactive.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      teamUser.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid team credentials.",
      });
    }

    const team = await RescueTeam.findById(
      teamUser.team_id
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found.",
      });
    }

    const token = jwt.sign(
      {
        id: teamUser._id,
        team_id: team._id,
        role: "rescue_team",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Rescue team login successful.",
      token,
      user: {
        id: teamUser._id,
        team_id: team._id,
        username: teamUser.username,
        role: "rescue_team",
        team: team,
      },
    });
  } catch (error) {
    console.error(
      "Rescue team login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to login rescue team.",
    });
  }
};

module.exports = {
  loginRescueTeam,
};