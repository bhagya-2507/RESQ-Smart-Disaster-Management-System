const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    resource_name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    resource_type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    available_quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
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

    status: {
      type: String,
      enum: ["Available", "Allocated", "Depleted"],
      default: "Available",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);