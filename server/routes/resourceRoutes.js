const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  updateResourceStatus,
} = require("../controllers/resourceController");

const router = express.Router();

// Get all resources
router.get("/", protect, adminOnly, getAllResources);

// Add resource
router.post("/", protect, adminOnly, createResource);

// Edit resource
router.patch("/:id", protect, adminOnly, updateResource);

// Delete resource
router.delete("/:id", protect, adminOnly, deleteResource);

// Update resource status
router.patch("/:id/status", protect, adminOnly, updateResourceStatus);

module.exports = router;