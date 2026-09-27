const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const Admin = require("./models/admin");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const existingAdmin = await Admin.findOne({
      username: "admin",
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(
      "Admin@123",
      12
    );

    const admin = await Admin.create({
      username: "admin",
      full_name: "RESQ Administrator",
      email: "admin@resq.com",
      password_hash: passwordHash,
      role: "admin",
      status: "Active",
    });

    console.log("Admin created successfully.");
    console.log("Username: admin");
    console.log("Password: Admin@123");
    console.log("Admin ID:", admin._id);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:");
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();