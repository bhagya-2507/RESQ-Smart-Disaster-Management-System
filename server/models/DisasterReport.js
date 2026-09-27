const mongoose = require("mongoose");

const disasterReportSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },

    disaster_type: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
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

    affected_people: {
      type: Number,
      required: true,
      min: 0,
    },

    injured_people: {
      type: Number,
      required: true,
      min: 0,
    },

    missing_people: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    report_image: {
      type: String,
      default: null,
    },

    priority_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    priority_level: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      default: "LOW",
    },

    ai_recommendation: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Response Dispatched",
        "Resolved",
        "Rejected",
      ],
      default: "Pending",
    },

    assigned_team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RescueTeam",
      default: null,
    },

    assigned_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DisasterReport", disasterReportSchema);