const DisasterReport = require("../models/DisasterReport");

const getReportById = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id)
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Disaster report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    console.error(
      "Get report by id error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch disaster report.",
    });
  }
};
const assignRescueTeam = async (req, res) => {
  try {
    const { team_id } = req.body;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: "Rescue team is required.",
      });
    }

    const report = await DisasterReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Disaster report not found.",
      });
    }

    if (report.status === "Resolved" || report.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "A resolved or rejected report cannot be assigned.",
      });
    }

    const RescueTeam = require("../models/RescueTeam");

    const team = await RescueTeam.findOneAndUpdate(
      {
        _id: team_id,
        status: "Active",
        availability: "Available",
      },
      {
        availability: "Busy",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!team) {
      return res.status(400).json({
        success: false,
        message: "Selected team is not available.",
      });
    }

    report.assigned_team = team._id;
    report.assigned_at = new Date();

    if (report.status === "Pending" || report.status === "Under Review") {
      report.status = "Response Dispatched";
    }

    await report.save();

    const updatedReport = await DisasterReport.findById(report._id)
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      )
      .populate(
        "assigned_team",
        "team_name team_code leader_name contact specialization members_count location city state latitude longitude status availability"
      );

    return res.status(200).json({
      success: true,
      message: "Rescue team assigned successfully.",
      report: updatedReport,
    });

  } catch (error) {
    console.error("Assign rescue team error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to assign rescue team.",
    });
  }
};
module.exports = {
  getReportById,
  assignRescueTeam,
};