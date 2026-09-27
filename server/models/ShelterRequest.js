const mongoose = require("mongoose");

const shelterRequestSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },

    shelter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
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

    people_count: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    emergency_reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Checked In",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    admin_note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    approved_at: {
      type: Date,
      default: null,
    },

    checked_in_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ShelterRequest",
  shelterRequestSchema
);