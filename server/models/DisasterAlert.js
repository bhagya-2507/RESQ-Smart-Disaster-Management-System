const mongoose = require("mongoose");

const disasterAlertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    alert_type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "High",
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
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

    issued_by: {
      type: String,
      default: "RESQ Command Center",
      trim: true,
      maxlength: 100,
    },

    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },

    expires_at: {
      type: Date,
      default: null,
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

module.exports = mongoose.model("DisasterAlert", disasterAlertSchema);