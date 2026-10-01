
const DisasterReport = require("../models/DisasterReport");
const VulnerableHabitation = require("../models/VulnerableHabitation");
const Shelter = require("../models/Shelter");
const RescueTeam = require("../models/RescueTeam");

// Find the highest-risk habitation and available shelters
// matching the report's city and state.
const getLocationAssessment = async (report) => {
  const city = String(report.city || "").trim();
  const state = String(report.state || "").trim();

  if (!city || !state) {
    return {
      relocation_assessment: null,
      shelter_assessment: null,
    };
  }

  const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const locationFilter = {
    city: {
      $regex: `^${escapeRegex(city)}$`,
      $options: "i",
    },
    state: {
      $regex: `^${escapeRegex(state)}$`,
      $options: "i",
    },
  };

  const [relocationAssessment, openShelters] = await Promise.all([
    VulnerableHabitation.findOne(locationFilter)
      .sort({ risk_score: -1, createdAt: -1 })
      .select(
        "habitation_name city state risk_level risk_score relocation_priority relocation_recommendation immediate_relocation_required vulnerable_people total_population"
      )
      .lean(),

    Shelter.find({
      ...locationFilter,
      status: "Open",
    })
      .select(
        "shelter_name capacity occupied city state location status"
      )
      .lean(),
  ]);

  const sheltersWithCapacity = openShelters.map((shelter) => ({
    ...shelter,
    available_capacity: Math.max(
      0,
      Number(shelter.capacity || 0) -
        Number(shelter.occupied || 0)
    ),
  }));

  const totalAvailableCapacity = sheltersWithCapacity.reduce(
    (total, shelter) => total + shelter.available_capacity,
    0
  );

  const relocationPopulation = relocationAssessment
    ? Number(relocationAssessment.total_population || 0)
    : Number(report.affected_people || 0);

  return {
    relocation_assessment: relocationAssessment,
    shelter_assessment: {
      open_shelter_count: sheltersWithCapacity.length,
      total_available_capacity: totalAvailableCapacity,
      relocation_population_estimate: relocationPopulation,
      estimated_capacity_gap: Math.max(
        0,
        relocationPopulation - totalAvailableCapacity
      ),
      shelters: sheltersWithCapacity,
    },
  };
};

// Fetch report AND its current location assessment.
const getReportById = async (req, res) => {
  try {
    const report = await DisasterReport.findById(req.params.id)
      .populate("citizen_id", "full_name email mobile city state")
      .populate(
        "assigned_team",
        "team_name team_code leader_name contact specialization members_count location city state latitude longitude status availability"
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Disaster report not found.",
      });
    }

    const assessment = await getLocationAssessment(report);

    return res.status(200).json({
      success: true,
      report,
      ...assessment,
    });
  } catch (error) {
    console.error("Get report by id error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch disaster report.",
    });
  }
};

// Assign a rescue team to the report.
const assignRescueTeam = async (req, res) => {
  let assignedTeamId = null;

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

    // If this report already has a team, don't consume another team.
    if (report.assigned_team) {
      return res.status(400).json({
        success: false,
        message: "A rescue team is already assigned to this report.",
      });
    }

    const team = await RescueTeam.findOneAndUpdate(
      {
        _id: team_id,
        status: "Active",
        availability: "Available",
      },
      {
        $set: { availability: "Busy" },
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

    assignedTeamId = team._id;

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

    const assessment = await getLocationAssessment(updatedReport);

    return res.status(200).json({
      success: true,
      message: "Rescue team assigned successfully.",
      report: updatedReport,
      ...assessment,
    });
  } catch (error) {
    // Release the team if assignment failed after it was marked Busy.
    if (assignedTeamId) {
      try {
        await RescueTeam.findByIdAndUpdate(assignedTeamId, {
          $set: { availability: "Available" },
        });
      } catch (releaseError) {
        console.error(
          "Unable to release rescue team:",
          releaseError.message
        );
      }
    }

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