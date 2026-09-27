const DisasterReport = require("../models/DisasterReport");

const calculatePriority = ({
  affected_people,
  injured_people,
  missing_people,
  severity,
}) => {
  const severityWeights = {
    Critical: 50,
    High: 35,
    Medium: 20,
    Low: 10,
  };

  const score = Math.min(
    100,
    affected_people * 2 +
      injured_people * 4 +
      missing_people * 5 +
      (severityWeights[severity] || 10)
  );

  let priority_level = "LOW";
  let ai_recommendation = "Continue monitoring the incident.";

  if (score >= 80) {
    priority_level = "CRITICAL";
    ai_recommendation = "Immediate emergency response required.";
  } else if (score >= 60) {
    priority_level = "HIGH";
    ai_recommendation = "High priority rescue response recommended.";
  } else if (score >= 35) {
    priority_level = "MEDIUM";
    ai_recommendation =
      "Monitor incident and allocate required resources.";
  }

  return {
    priority_score: score,
    priority_level,
    ai_recommendation,
  };
};

const submitReport = async (req, res) => {
  try {
    const {
      disaster_type,
      severity,
      location,
      city,
      state,
      affected_people,
      injured_people,
      missing_people,
      description,
      latitude,
longitude,
    } = req.body;

    if (
      !disaster_type ||
      !severity ||
      !location ||
      !city ||
      !state ||
      affected_people === undefined ||
      injured_people === undefined ||
      missing_people === undefined ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const affected = Number(affected_people);
    const injured = Number(injured_people);
    const missing = Number(missing_people);

    if (
      !Number.isInteger(affected) ||
      !Number.isInteger(injured) ||
      !Number.isInteger(missing) ||
      affected < 0 ||
      injured < 0 ||
      missing < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "People counts must be valid non-negative numbers.",
      });
    }

    if (injured > affected) {
      return res.status(400).json({
        success: false,
        message: "Injured people cannot be greater than affected people.",
      });
    }

    if (missing > affected) {
      return res.status(400).json({
        success: false,
        message: "Missing people cannot be greater than affected people.",
      });
    }

    if (location.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a more specific incident location.",
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must contain at least 10 characters.",
      });
    }

    const priority = calculatePriority({
      affected_people: affected,
      injured_people: injured,
      missing_people: missing,
      severity,
    });

    const report = await DisasterReport.create({
      citizen_id: req.user.id,
      disaster_type: disaster_type.trim(),
      severity,
      location: location.trim(),
      city: city.trim(),
      state: state.trim(),
      latitude:
  latitude !== undefined && latitude !== ""
    ? Number(latitude)
    : null,

longitude:
  longitude !== undefined && longitude !== ""
    ? Number(longitude)
    : null,
      affected_people: affected,
      injured_people: injured,
      missing_people: missing,
      description: description.trim(),
      report_image: req.file ? req.file.filename : null,
      priority_score: priority.priority_score,
      priority_level: priority.priority_level,
      ai_recommendation: priority.ai_recommendation,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Disaster report submitted successfully.",
      report,
    });
  } catch (error) {
    console.error("Report submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting report.",
    });
  }
};
const getMyReports = async (req, res) => {
  try {
    const reports = await DisasterReport.find({
      citizen_id: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Fetch reports error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching reports.",
    });
  }
};
const getAllReports = async (req, res) => {
  try {
    const reports = await DisasterReport.find()
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get all reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch disaster reports.",
    });
  }
};
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Response Dispatched",
      "Resolved",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status.",
      });
    }

    const report = await DisasterReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Disaster report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully.",
      report,
    });
  } catch (error) {
    console.error("Update report status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update report status.",
    });
  }
};
module.exports = {
  submitReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
};