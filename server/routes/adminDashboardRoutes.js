const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAdminDashboard,
} = require("../controllers/adminDashboardController");

const router = express.Router();

router.get(
  "/",
  protect,
  adminOnly,
  getAdminDashboard
);

module.exports = router;