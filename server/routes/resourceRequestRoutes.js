const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  createResourceRequest,
  getAvailableResources,
  getMyResourceRequests,
  getAllResourceRequests,
  updateResourceRequestStatus,
  allocateResource,
} = require("../controllers/resourceRequestController");


// =====================================================
// CITIZEN
// =====================================================

router.get(
  "/catalog",
  protect,
  getAvailableResources
);

router.post(
  "/",
  protect,
  createResourceRequest
);

router.get(
  "/my",
  protect,
  getMyResourceRequests
);


// =====================================================
// ADMIN
// =====================================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAllResourceRequests
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateResourceRequestStatus
);

router.post(
  "/admin/:id/allocate",
  protect,
  adminOnly,
  allocateResource
);

module.exports = router;