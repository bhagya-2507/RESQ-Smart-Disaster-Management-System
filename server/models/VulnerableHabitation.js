const mongoose = require("mongoose");

const vulnerableHabitationSchema = new mongoose.Schema(
  {
    habitation_name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    total_population: {
      type: Number,
      required: true,
      min: 0,
    },
    vulnerable_people: {
      type: Number,
      required: true,
      min: 0,
    },
    hazard_type: {
      type: String,
      required: true,
      enum: [
        "Flood",
        "Earthquake",
        "Landslide",
        "Cyclone",
        "Fire",
        "Other",
      ],
    },
    risk_level: {
      type: String,
      enum: ["Red", "Orange", "Yellow", "Green"],
      default: "Orange",
    },
    immediate_relocation_required: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "VulnerableHabitation",
  vulnerableHabitationSchema
);