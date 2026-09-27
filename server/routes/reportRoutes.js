const express = require("express");
const multer = require("multer");
const path = require("path");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  submitReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
} = require("../controllers/reportController");

const router = express.Router();
const {
  getReportById,
  assignRescueTeam,
} = require("../controllers/reportDetailsController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/reports");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".png", ".jpg", ".jpeg"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG and JPEG images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/",
  protect,
  upload.single("report_image"),
  submitReport
);
router.get("/my", protect, getMyReports);
router.get(
  "/admin",
  protect,
  adminOnly,
  getAllReports
);
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getReportById
);
router.patch(
  "/admin/:id/assign-team",
  protect,
  adminOnly,
  assignRescueTeam
);
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateReportStatus
);

module.exports = router;