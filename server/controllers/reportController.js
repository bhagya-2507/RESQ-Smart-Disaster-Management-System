
const DisasterReport = require("../models/DisasterReport");
const VulnerableHabitation = require("../models/VulnerableHabitation");
const Shelter = require("../models/Shelter");

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const rad = (value) => (value * Math.PI) / 180;

  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(rad(lon2 - lon1) / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildLocationAssessment = async (report) => {
  const city = new RegExp(`^${escapeRegex(report.city)}$`, "i");
  const state = new RegExp(`^${escapeRegex(report.state)}$`, "i");

  const [habitations, shelters] = await Promise.all([
    VulnerableHabitation.find({ city, state })
      .sort({ risk_score: -1, vulnerable_people: -1 })
      .lean(),

    Shelter.find({ city, state, status: "Open" })
      .select(
        "shelter_name shelter_type capacity occupied location city state contact facilities latitude longitude status"
      )
      .lean(),
  ]);

  let habitation = null;
  let matchMethod = "city_state";

  if (report.latitude != null && report.longitude != null) {
    const nearest = habitations
      .filter(
        (item) =>
          Number.isFinite(Number(item.latitude)) &&
          Number.isFinite(Number(item.longitude))
      )
      .map((item) => ({
        ...item,
        distance_km: distanceKm(
          Number(report.latitude),
          Number(report.longitude),
          Number(item.latitude),
          Number(item.longitude)
        ),
      }))
      .sort((a, b) => a.distance_km - b.distance_km)[0];

    if (nearest && nearest.distance_km <= 10) {
      habitation = nearest;
      matchMethod = "gps_within_10km";
    }
  }

  if (!habitation && habitations.length > 0) {
    habitation = habitations[0];
    matchMethod = "city_state";
  }

  const availableShelters = shelters
    .map((shelter) => ({
      ...shelter,
      available_capacity: Math.max(
        0,
        Number(shelter.capacity || 0) -
          Number(shelter.occupied || 0)
      ),
    }))
    .filter((shelter) => shelter.available_capacity > 0)
    .sort((a, b) => b.available_capacity - a.available_capacity);

  const totalAvailableCapacity = availableShelters.reduce(
    (total, shelter) => total + shelter.available_capacity,
    0
  );

  const relocationPopulation = habitation
    ? Number(
        habitation.total_population ||
          report.affected_people ||
          0
      )
    : Number(report.affected_people || 0);

  const highRisk =
    habitation &&
    (habitation.immediate_relocation_required ||
      habitation.risk_level === "Red" ||
      Number(habitation.risk_score) >= 75);

  return {
    location_assessment: {
      matched: Boolean(habitation),
      match_method: habitation ? matchMethod : "no_match",
      distance_km: habitation?.distance_km ?? null,

      habitation: habitation
        ? {
            _id: habitation._id,
            habitation_name: habitation.habitation_name,
            city: habitation.city,
            state: habitation.state,
            hazard_type: habitation.hazard_type,
            risk_level: habitation.risk_level,
            risk_score: habitation.risk_score,
            relocation_priority: habitation.relocation_priority,
            relocation_recommendation:
              habitation.relocation_recommendation,
            immediate_relocation_required:
              habitation.immediate_relocation_required,
            total_population: habitation.total_population,
            vulnerable_people: habitation.vulnerable_people,
          }
        : null,

      warning: !habitation
        ? "No registered vulnerable habitation matched this city/state. Authorities must verify the location risk."
        : highRisk
        ? "HIGH RISK: This report matches a registered high-risk habitation. Follow official emergency instructions and await authority verification."
        : `Registered habitation found with ${
            habitation.risk_level || "unclassified"
          } risk. Await authority verification and follow official instructions.`,
    },

    shelter_assessment: {
      open_shelter_count: availableShelters.length,
      total_available_capacity: totalAvailableCapacity,
      relocation_population_estimate: relocationPopulation,
      estimated_capacity_gap: Math.max(
        0,
        relocationPopulation - totalAvailableCapacity
      ),
      shelters: availableShelters.slice(0, 5),
      note:
        "Capacity is estimated from registered records and may not reflect live occupancy. Confirm availability with authorities before travelling.",
    },
  };
};

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
        message:
          "People counts must be valid non-negative numbers.",
      });
    }

    if (injured > affected || missing > affected) {
      return res.status(400).json({
        success: false,
        message:
          "Injured or missing people cannot be greater than affected people.",
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

    const parsedLatitude =
      latitude !== undefined && latitude !== ""
        ? Number(latitude)
        : null;

    const parsedLongitude =
      longitude !== undefined && longitude !== ""
        ? Number(longitude)
        : null;

    if (
      (parsedLatitude !== null &&
        (!Number.isFinite(parsedLatitude) ||
          parsedLatitude < -90 ||
          parsedLatitude > 90)) ||
      (parsedLongitude !== null &&
        (!Number.isFinite(parsedLongitude) ||
          parsedLongitude < -180 ||
          parsedLongitude > 180))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid GPS coordinates.",
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
      latitude: parsedLatitude,
      longitude: parsedLongitude,
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

    let assessment = {};

    try {
      assessment = await buildLocationAssessment(report);
    } catch (assessmentError) {
      console.error(
        "Location assessment error:",
        assessmentError.message
      );

      assessment = {
        location_assessment: {
          matched: false,
          match_method: "assessment_unavailable",
          distance_km: null,
          habitation: null,
          warning:
            "Your report was saved, but automatic location assessment is temporarily unavailable. Authorities must verify the location.",
        },
        shelter_assessment: {
          open_shelter_count: 0,
          total_available_capacity: 0,
          relocation_population_estimate: affected,
          estimated_capacity_gap: affected,
          shelters: [],
          note:
            "Shelter assessment is temporarily unavailable. Please confirm shelter availability with authorities.",
        },
      };
    }

    return res.status(201).json({
      success: true,
      message: "Disaster report submitted successfully.",
      report,
      ...assessment,
    });
  } catch (error) {
    console.error("Report submission error:", error);

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
    console.error("Fetch reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching reports.",
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await DisasterReport.find()
      .populate("citizen_id", "full_name email mobile city state")
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