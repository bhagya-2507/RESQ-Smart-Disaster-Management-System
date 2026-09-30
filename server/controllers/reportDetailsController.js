
const DisasterReport = require("../models/DisasterReport");
const VulnerableHabitation = require("../models/VulnerableHabitation");
const Shelter = require("../models/Shelter");

const getReportById = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id)
      .populate("citizen_id", "full_name email mobile city state");

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
    console.error("Get report by id error:", error.message);

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

    if (
      report.status === "Resolved" ||
      report.status === "Rejected"
    ) {
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

    if (
      report.status === "Pending" ||
      report.status === "Under Review"
    ) {
      report.status = "Response Dispatched";
    }

    await report.save();

    const updatedReport = await DisasterReport.findById(report._id)
      .populate("citizen_id", "full_name email mobile city state")
      .populate(
        "assigned_team",
        "team_name team_code leader_name contact specialization members_count location city state latitude longitude status availability"
      );

    // Find the highest-risk habitation in the same city and state.
    let relocationAssessment = null;

    if (
      typeof report.city === "string" &&
      report.city.trim() &&
      typeof report.state === "string" &&
      report.state.trim()
    ) {
      const escapeRegex = (value) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      relocationAssessment = await VulnerableHabitation.findOne({
        city: {
          $regex: `^${escapeRegex(report.city.trim())}$`,
          $options: "i",
        },
        state: {
          $regex: `^${escapeRegex(report.state.trim())}$`,
          $options: "i",
        },
      })
        .sort({ risk_score: -1, createdAt: -1 })
        .select(
          "habitation_name city state risk_level risk_score relocation_priority relocation_recommendation immediate_relocation_required vulnerable_people total_population"
        )
        .lean();
    }
    
let shelterAssessment = null;

if (
  typeof report.city === "string" &&
  report.city.trim() &&
  typeof report.state === "string" &&
  report.state.trim()
) {
  const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const openShelters = await Shelter.find({
    status: "Open",
    city: {
      $regex: `^${escapeRegex(report.city.trim())}$`,
      $options: "i",
    },
    state: {
      $regex: `^${escapeRegex(report.state.trim())}$`,
      $options: "i",
    },
  })
    .select("shelter_name capacity occupied city state location status")
    .lean();

  const sheltersWithCapacity = openShelters.map((shelter) => ({
    ...shelter,
    available_capacity: Math.max(
      0,
      (shelter.capacity || 0) - (shelter.occupied || 0)
    ),
  }));

  const totalAvailableCapacity = sheltersWithCapacity.reduce(
    (total, shelter) => total + shelter.available_capacity,
    0
  );

  const relocationPopulation = relocationAssessment
    ? Number(relocationAssessment.total_population || 0)
    : Number(report.affected_people || 0);

  shelterAssessment = {
    open_shelter_count: sheltersWithCapacity.length,
    total_available_capacity: totalAvailableCapacity,
    relocation_population_estimate: relocationPopulation,
    estimated_capacity_gap: Math.max(
      0,
      relocationPopulation - totalAvailableCapacity
    ),
    shelters: sheltersWithCapacity,
  };
}

    return res.status(200).json({
      success: true,
      message: "Rescue team assigned successfully.",
      report: updatedReport,
      relocation_assessment: relocationAssessment,
      shelter_assessment: shelterAssessment,
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