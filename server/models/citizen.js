const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },

    password_hash: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
          reset_otp_hash: {
      type: String,
      default: null,
    },

    reset_otp_expires: {
      type: Date,
      default: null,
    },
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    profile_image: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Citizen", citizenSchema);