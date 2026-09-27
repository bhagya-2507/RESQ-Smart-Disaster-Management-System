
const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createShelterRequest,
  getMyShelterRequests,
  getAllShelterRequests,
  updateShelterRequestStatus,
} = require("../controllers/shelterRequestController");

const router = express.Router();

// Citizen creates a shelter request
router.post("/", protect, createShelterRequest);

// Citizen views own requests
router.get("/my", protect, getMyShelterRequests);

// Admin views all shelter requests
router.get("/admin", protect, adminOnly, getAllShelterRequests);

// Admin updates request status
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateShelterRequestStatus
);

module.exports = router;