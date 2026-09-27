const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAllShelters,
  createShelter,
  updateShelter,
  deleteShelter,
  updateShelterStatus,
  getAvailableShelters,
} = require("../controllers/shelterController");

const router = express.Router();

// Get all shelters
router.get("/", protect, adminOnly, getAllShelters);

// Add shelter
router.post("/", protect, adminOnly, createShelter);

// Edit shelter
router.patch("/:id", protect, adminOnly, updateShelter);

// Delete shelter
router.delete("/:id", protect, adminOnly, deleteShelter);

// Update shelter status
router.patch("/:id/status", protect, adminOnly, updateShelterStatus);
router.get("/available", protect, getAvailableShelters);

module.exports = router;