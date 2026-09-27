
const express = require("express");

const router = express.Router();

const {
  submitFeedback,
  getFeedbackByRequest,
  getAllFeedback,
} = require("../controllers/feedbackController");

// Submit feedback
router.post("/", submitFeedback);

// IMPORTANT: Keep admin route before dynamic route
router.get("/admin/all", getAllFeedback);

// Get feedback by rescue request ID
router.get("/:rescue_request_id", getFeedbackByRequest);

module.exports = router;