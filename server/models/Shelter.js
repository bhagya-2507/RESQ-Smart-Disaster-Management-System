const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
  {
    shelter_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    shelter_type: {
      type: String,
      enum: ["Relief Camp", "Emergency Shelter", "Temporary Shelter"],
      default: "Relief Camp",
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    occupied: {
      type: Number,
      default: 0,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    contact: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },

    facilities: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["Open", "Full", "Closed"],
      default: "Open",
    },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shelter", shelterSchema);