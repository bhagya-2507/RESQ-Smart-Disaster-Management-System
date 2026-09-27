const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  updateTeamAvailability,
} = require("../controllers/rescueTeamController");

const {
  getTeamDashboard,
  updateTeamReportStatus,
  updateTeamRequestStatus,
} = require("../controllers/rescueTeamDashboardController");

const router = express.Router();


// =====================================================
// ADMIN — RESCUE TEAM MANAGEMENT
// =====================================================

router.get(
  "/",
  protect,
  adminOnly,
  getAllTeams
);

router.post(
  "/",
  protect,
  adminOnly,
  createTeam
);

router.patch(
  "/:id",
  protect,
  adminOnly,
  updateTeam
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteTeam
);

router.patch(
  "/:id/availability",
  protect,
  adminOnly,
  updateTeamAvailability
);


// =====================================================
// RESCUE TEAM — DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  protect,
  getTeamDashboard
);


// =====================================================
// RESCUE TEAM — INCIDENT STATUS
// =====================================================

router.patch(
  "/reports/:id/status",
  protect,
  updateTeamReportStatus
);


// =====================================================
// RESCUE TEAM — RESCUE REQUEST STATUS
// =====================================================

router.patch(
  "/requests/:id/status",
  protect,
  updateTeamRequestStatus
);


module.exports = router;