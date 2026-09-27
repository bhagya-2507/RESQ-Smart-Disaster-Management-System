
const Feedback = require("../models/Feedback");

// Submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { citizen_id, rescue_request_id, rating, comment } = req.body;

    if (!citizen_id || !rescue_request_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Citizen ID, rescue request ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const existingFeedback = await Feedback.findOne({
      rescue_request_id,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this request",
      });
    }

    const feedback = await Feedback.create({
      citizen_id,
      rescue_request_id,
      rating,
      comment: comment || "",
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while submitting feedback",
    });
  }
};

// Get feedback by rescue request
const getFeedbackByRequest = async (req, res) => {
  try {
    const { rescue_request_id } = req.params;

    const feedback = await Feedback.findOne({
      rescue_request_id,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Get feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching feedback",
    });
  }
};

// Get all feedback for admin dashboard
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate(
        "citizen_id",
        "full_name email phone location city state"
      )
      .populate(
        "rescue_request_id",
        "disaster_type severity location city state status createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const totalFeedback = feedback.length;

    const averageRating =
      totalFeedback > 0
        ? (
            feedback.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / totalFeedback
          ).toFixed(2)
        : 0;

    const ratingDistribution = {
      oneStar: feedback.filter((item) => item.rating === 1).length,
      twoStar: feedback.filter((item) => item.rating === 2).length,
      threeStar: feedback.filter((item) => item.rating === 3).length,
      fourStar: feedback.filter((item) => item.rating === 4).length,
      fiveStar: feedback.filter((item) => item.rating === 5).length,
    };

    res.status(200).json({
      success: true,

      analytics: {
        totalFeedback,
        averageRating: Number(averageRating),
        ratingDistribution,
      },

      feedback,
    });
  } catch (error) {
    console.error("Admin feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching feedback",
    });
  }
};


module.exports = {
  submitFeedback,
  getFeedbackByRequest,
  getAllFeedback,
};