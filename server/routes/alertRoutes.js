const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAllAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  updateAlertStatus,
} = require("../controllers/alertController");

const router = express.Router();

// Get alerts
// Citizens can view alerts
router.get("/", protect, getAllAlerts);

// Create alert - Admin only
router.post("/", protect, adminOnly, createAlert);

// Edit alert - Admin only
router.patch("/:id", protect, adminOnly, updateAlert);

// Delete alert - Admin only
router.delete("/:id", protect, adminOnly, deleteAlert);

// Update alert status - Admin only
router.patch("/:id/status", protect, adminOnly, updateAlertStatus);

module.exports = router;