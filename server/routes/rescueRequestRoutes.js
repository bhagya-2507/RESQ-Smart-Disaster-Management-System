const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createRescueRequest,
  getMyRescueRequests,
  getAllRescueRequests,
  updateRescueRequestStatus,
  assignRescueTeamToRequest
} = require("../controllers/rescueRequestController");

const router = express.Router();

/* =========================================
   CITIZEN
========================================= */

router.post(
  "/",
  protect,
  createRescueRequest
);

router.get(
  "/my",
  protect,
  getMyRescueRequests
);

/* =========================================
   ADMIN
========================================= */

router.get(
  "/admin",
  protect,
  adminOnly,
  getAllRescueRequests
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateRescueRequestStatus
);
router.patch(
  "/admin/:id/assign-team",
  protect,
  adminOnly,
  assignRescueTeamToRequest
);

module.exports = router;