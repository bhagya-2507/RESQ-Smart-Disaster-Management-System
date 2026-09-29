
const DisasterReport = require("../models/DisasterReport");
const RescueRequest = require("../models/RescueRequest");
const Citizen = require("../models/citizen");

const getAdminDashboard = async (req, res) => {
  try {
    // DISASTER REPORTS
    const reports = await DisasterReport.find()
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      )
      .sort({ createdAt: -1 });

    // RESCUE REQUESTS
    const rescueRequests = await RescueRequest.find()
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      )
      .sort({ createdAt: -1 });

    // REGISTERED CITIZENS
    const [totalCitizens, citizens] = await Promise.all([
      Citizen.countDocuments(),
      Citizen.find()
        .select("full_name email mobile city state status createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // DASHBOARD STATS
    const activeReports = reports.filter(
      (report) =>
        report.status === "Pending" ||
        report.status === "Under Review" ||
        report.status === "Response Dispatched"
    ).length;

    const criticalReports = reports.filter(
      (report) => report.priority_level === "CRITICAL"
    ).length;

    const pendingRequests = rescueRequests.filter(
      (request) => request.status === "Pending"
    ).length;

    const resolvedDisasterReports = reports.filter(
      (report) => report.status === "Resolved"
    ).length;

    const resolvedRescueRequests = rescueRequests.filter(
      (request) => request.status === "Resolved"
    ).length;

    const resolvedCases =
      resolvedDisasterReports + resolvedRescueRequests;

    // RESPONSE
    return res.status(200).json({
      success: true,

      stats: {
        totalReports: reports.length,
        activeReports,
        criticalReports,
        pendingRequests,
        resolvedCases,
        totalRescueRequests: rescueRequests.length,
        totalCitizens,
      },

      reports,
      rescueRequests,
      citizens,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard data.",
    });
  }
};

module.exports = {
  getAdminDashboard,
};