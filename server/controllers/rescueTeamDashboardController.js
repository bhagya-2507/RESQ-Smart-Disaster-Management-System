const mongoose = require("mongoose");

const RescueTeam = require("../models/RescueTeam");
const DisasterReport = require("../models/DisasterReport");
const RescueRequest = require("../models/RescueRequest");

// =====================================================
// GET RESCUE TEAM DASHBOARD
// =====================================================

const getTeamDashboard = async (req, res) => {
  try {
    const teamId = req.user.team_id;

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rescue team account.",
      });
    }

    const team = await RescueTeam.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found.",
      });
    }

    const reports = await DisasterReport.find({
      assigned_team: teamId,
    })
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      )
      .sort({ assigned_at: -1 });

    const requests = await RescueRequest.find({
      assigned_team_id: teamId,
    })
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      team,

      reports,

      requests,

      stats: {
        totalReports: reports.length,

        pendingReports: reports.filter(
          (report) =>
            report.status === "Pending" ||
            report.status === "Under Review" ||
            report.status === "Response Dispatched"
        ).length,

        respondingReports: reports.filter(
          (report) =>
            report.status === "Responding"
        ).length,

        resolvedReports: reports.filter(
          (report) =>
            report.status === "Resolved"
        ).length,

        totalRequests: requests.length,

        pendingRequests: requests.filter(
          (request) =>
            request.status === "Pending"
        ).length,

        respondingRequests: requests.filter(
          (request) =>
            request.status === "Responding"
        ).length,

        resolvedRequests: requests.filter(
          (request) =>
            request.status === "Resolved"
        ).length,
      },
    });
  } catch (error) {
    console.error(
      "Team dashboard error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load rescue team dashboard.",
    });
  }
};


// =====================================================
// UPDATE ASSIGNED REPORT STATUS
// =====================================================

const updateTeamReportStatus = async (req, res) => {
  try {
    const teamId = req.user.team_id;
    const reportId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "Response Dispatched",
      "Responding",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident status.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID.",
      });
    }

    const report = await DisasterReport.findOne({
      _id: reportId,
      assigned_team: teamId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message:
          "Incident not found or not assigned to your team.",
      });
    }

    if (
      report.status === "Resolved" &&
      status !== "Resolved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A resolved incident cannot be reopened.",
      });
    }

    report.status = status;

    await report.save();

    const updatedReport =
      await DisasterReport.findById(report._id)
        .populate(
          "citizen_id",
          "full_name email mobile city state"
        )
        .populate(
          "assigned_team",
          "team_name team_code leader_name contact specialization members_count location city state latitude longitude status availability"
        );

    // Free team only when no active operation remains.
    if (status === "Resolved") {
      await releaseTeamIfNoActiveOperations(teamId);
    }

    return res.status(200).json({
      success: true,
      message:
        "Incident status updated successfully.",
      report: updatedReport,
    });
  } catch (error) {
    console.error(
      "Team report status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update incident status.",
    });
  }
};


// =====================================================
// UPDATE ASSIGNED RESCUE REQUEST STATUS
// =====================================================

const updateTeamRequestStatus = async (req, res) => {
  try {
    const teamId = req.user.team_id;
    const requestId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Responding",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rescue request status.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rescue request ID.",
      });
    }

    const request = await RescueRequest.findOne({
      _id: requestId,
      assigned_team_id: teamId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message:
          "Rescue request not found or not assigned to your team.",
      });
    }

    if (
      request.status === "Resolved" &&
      status !== "Resolved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A resolved rescue request cannot be reopened.",
      });
    }

    request.status = status;

    await request.save();

    const updatedRequest =
      await RescueRequest.findById(request._id)
        .populate(
          "citizen_id",
          "full_name email mobile city state"
        )
        .populate(
          "assigned_team_id",
          "team_name team_code leader_name contact specialization members_count location city state latitude longitude status availability"
        );

    if (status === "Resolved") {
      await releaseTeamIfNoActiveOperations(teamId);
    }

    return res.status(200).json({
      success: true,
      message:
        "Rescue request status updated successfully.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error(
      "Team rescue request status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update rescue request status.",
    });
  }
};


// =====================================================
// RELEASE TEAM WHEN ALL ASSIGNMENTS ARE RESOLVED
// =====================================================

const releaseTeamIfNoActiveOperations = async (
  teamId
) => {
  const activeReport = await DisasterReport.exists({
    assigned_team: teamId,
    status: {
      $nin: ["Resolved", "Rejected"],
    },
  });

  const activeRequest =
    await RescueRequest.exists({
      assigned_team_id: teamId,
      status: {
        $ne: "Resolved",
      },
    });

  if (!activeReport && !activeRequest) {
    await RescueTeam.findByIdAndUpdate(
      teamId,
      {
        availability: "Available",
      },
      {
        runValidators: true,
      }
    );
  }
};


module.exports = {
  getTeamDashboard,
  updateTeamReportStatus,
  updateTeamRequestStatus,
};