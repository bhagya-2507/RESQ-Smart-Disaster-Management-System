const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const RescueTeam = require("./models/RescueTeam");
const RescueTeamUser = require("./models/RescueTeamUser");

// Use the same MongoDB URI that your server uses
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resq_db";

const teams = [
  {
    team_name: "Delhi Rapid Response Team",
    team_code: "DRRT-01",
    leader_name: "Arjun Sharma",
    contact: "9876543210",
    specialization: "Urban Search and Rescue",
    members_count: 8,
    location: "Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    latitude: 28.6315,
    longitude: 77.2167,
    status: "Active",
    availability: "Available",
  },

  {
    team_name: "Yamuna Flood Response Unit",
    team_code: "YFRU-02",
    leader_name: "Rahul Verma",
    contact: "9876543211",
    specialization: "Flood Rescue and Water Operations",
    members_count: 10,
    location: "Mayur Vihar",
    city: "New Delhi",
    state: "Delhi",
    latitude: 28.6087,
    longitude: 77.2946,
    status: "Active",
    availability: "Available",
  },

  {
    team_name: "North Delhi Emergency Team",
    team_code: "NDET-03",
    leader_name: "Vikram Singh",
    contact: "9876543212",
    specialization: "Emergency Medical Response",
    members_count: 7,
    location: "Civil Lines",
    city: "New Delhi",
    state: "Delhi",
    latitude: 28.6765,
    longitude: 77.2263,
    status: "Active",
    availability: "Busy",
  },

  {
    team_name: "South Delhi Rescue Unit",
    team_code: "SDRU-04",
    leader_name: "Rohit Mehta",
    contact: "9876543213",
    specialization: "Fire and Structural Rescue",
    members_count: 9,
    location: "Saket",
    city: "New Delhi",
    state: "Delhi",
    latitude: 28.5244,
    longitude: 77.2066,
    status: "Active",
    availability: "Available",
  },

  {
    team_name: "East Delhi Disaster Response",
    team_code: "EDDR-05",
    leader_name: "Amit Kumar",
    contact: "9876543214",
    specialization: "Disaster Response and Evacuation",
    members_count: 8,
    location: "Laxmi Nagar",
    city: "New Delhi",
    state: "Delhi",
    latitude: 28.6304,
    longitude: 77.2773,
    status: "Active",
    availability: "Available",
  },

  {
    team_name: "Central Emergency Rescue Team",
    team_code: "CERT-06",
    leader_name: "Nitin Kapoor",
    contact: "9876543215",
    specialization: "Medical Aid and Emergency Support",
    members_count: 6,
    location: "Karol Bagh",
    city: "New Delhi",
    state: "Delhi",
    latitude: 28.6517,
    longitude: 77.1909,
    status: "Active",
    availability: "Unavailable",
  },
];

const seedTeams = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected.");

    let added = 0;
    let skipped = 0;

    for (const teamData of teams) {
      const existingTeam = await RescueTeam.findOne({
        team_code: teamData.team_code,
      });

      if (existingTeam) {
        console.log(
          `Skipped existing team: ${teamData.team_code}`
        );

        skipped++;
        continue;
      }

      const team = await RescueTeam.create(teamData);

      const password_hash = await bcrypt.hash(
        "Rescue@123",
        10
      );

      await RescueTeamUser.create({
        team_id: team._id,
        username: team.team_code,
        password_hash,
        status: "Active",
      });

      console.log(
        `Added: ${team.team_name} (${team.team_code})`
      );

      added++;
    }

    console.log("");
    console.log("=================================");
    console.log("RESCUE TEAM SEED COMPLETED");
    console.log("=================================");
    console.log(`Added: ${added}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total configured: ${teams.length}`);
    console.log("");
    console.log("Team login password: Rescue@123");
    console.log("=================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedTeams();