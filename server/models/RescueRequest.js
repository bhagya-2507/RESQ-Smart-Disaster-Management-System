const mongoose = require("mongoose");

const rescueRequestSchema = new mongoose.Schema(
  {
    // Citizen who submitted the request
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },

    requester_name: {
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

    disaster_type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "High",
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
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

    people_count: {
      type: Number,
      required: true,
      min: 1,
      max: 100000,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    assigned_team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RescueTeam",
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Responding", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RescueRequest",
  rescueRequestSchema
);