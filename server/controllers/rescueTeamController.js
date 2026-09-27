const bcrypt = require("bcryptjs");

const RescueTeam = require("../models/RescueTeam");
const RescueTeamUser = require("../models/RescueTeamUser");

const getAllTeams = async (req, res) => {
  try {
    const teams = await RescueTeam.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Get teams error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch rescue teams.",
    });
  }
};



const createTeam = async (req, res) => {
  try {
    const {
      team_name,
      team_code,
      leader_name,
      contact,
      specialization,
      members_count,
      location,
      city,
      state,
      latitude,
      longitude,
      password,
    } = req.body;

    if (
      !team_name ||
      !team_code ||
      !leader_name ||
      !contact ||
      !specialization ||
      !members_count ||
      !location ||
      !city ||
      !state ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All required team fields and password are required.",
      });
    }

    if (!/^[0-9]{10}$/.test(contact)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must contain exactly 10 digits.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedTeamCode = team_code.trim().toUpperCase();

    const existingTeam = await RescueTeam.findOne({
      team_code: normalizedTeamCode,
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: "Team code already exists.",
      });
    }

    const existingUser = await RescueTeamUser.findOne({
      username: normalizedTeamCode,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Login username already exists.",
      });
    }

    const team = await RescueTeam.create({
      team_name: team_name.trim(),
      team_code: normalizedTeamCode,
      leader_name: leader_name.trim(),
      contact,
      specialization: specialization.trim(),
      members_count: Number(members_count),
      location: location.trim(),
      city: city.trim(),
      state: state.trim(),
      latitude:
        latitude !== undefined && latitude !== ""
          ? Number(latitude)
          : null,
      longitude:
        longitude !== undefined && longitude !== ""
          ? Number(longitude)
          : null,
    });

    try {
      const password_hash = await bcrypt.hash(password, 10);

      await RescueTeamUser.create({
        team_id: team._id,
        username: normalizedTeamCode,
        password_hash,
        status: "Active",
      });
    } catch (userError) {
      await RescueTeam.findByIdAndDelete(team._id);
      throw userError;
    }

    return res.status(201).json({
      success: true,
      message: "Rescue team and login account created successfully.",
      team,
    });
  } catch (error) {
    console.error("Create team error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create rescue team.",
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const {
      team_name,
      team_code,
      leader_name,
      contact,
      specialization,
      members_count,
      location,
      city,
      state,
      latitude,
      longitude,
      status,
      availability,
    } = req.body;

    if (
      contact &&
      !/^[0-9]{10}$/.test(contact)
    ) {
      return res.status(400).json({
        success: false,
        message: "Contact number must contain exactly 10 digits.",
      });
    }

    const team = await RescueTeam.findByIdAndUpdate(
      req.params.id,
      {
        team_name: team_name?.trim(),
        team_code: team_code?.trim().toUpperCase(),
        leader_name: leader_name?.trim(),
        contact,
        specialization: specialization?.trim(),
        members_count:
          members_count !== undefined
            ? Number(members_count)
            : undefined,
        location: location?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        latitude:
          latitude !== undefined && latitude !== ""
            ? Number(latitude)
            : null,
        longitude:
          longitude !== undefined && longitude !== ""
            ? Number(longitude)
            : null,
        status,
        availability,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rescue team updated successfully.",
      team,
    });
  } catch (error) {
    console.error("Update team error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update rescue team.",
    });
  }
};


const deleteTeam = async (req, res) => {
  try {
    const team = await RescueTeam.findByIdAndDelete(
      req.params.id
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rescue team deleted successfully.",
    });
  } catch (error) {
    console.error("Delete team error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete rescue team.",
    });
  }
};


const updateTeamAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const allowed = [
      "Available",
      "Busy",
      "Unavailable",
    ];

    if (!allowed.includes(availability)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status.",
      });
    }

    const team = await RescueTeam.findByIdAndUpdate(
      req.params.id,
      { availability },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team availability updated successfully.",
      team,
    });
  } catch (error) {
    console.error(
      "Availability update error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update team availability.",
    });
  }
};


module.exports = {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  updateTeamAvailability,
};