const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const RescueTeam = require("./models/RescueTeam");
const RescueTeamUser = require("./models/RescueTeamUser");

dotenv.config();

const createTeamUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const team = await RescueTeam.findOne({
      team_code: "RRT-001",
    });

    if (!team) {
      console.log("RRT-001 team not found.");
      process.exit(1);
    }

    const existing = await RescueTeamUser.findOne({
      username: "rrt001",
    });

    if (existing) {
      console.log("Team user already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(
      "Rescue@123",
      10
    );

    await RescueTeamUser.create({
      team_id: team._id,
      username: "rrt001",
      password_hash: passwordHash,
      status: "Active",
    });

    console.log("Rescue team user created.");
    console.log("Username: rrt001");
    console.log("Password: Rescue@123");

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

createTeamUser();