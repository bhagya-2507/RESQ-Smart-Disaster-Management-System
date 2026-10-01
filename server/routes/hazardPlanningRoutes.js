const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const VulnerableHabitation = require("../models/VulnerableHabitation");
const DisasterReport = require("../models/DisasterReport");
const Shelter = require("../models/Shelter");

const router = express.Router();


function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    earthRadiusKm *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function hasValidCoordinates(place) {
  const lat = Number(place.latitude);
  const lon = Number(place.longitude);

  return (
    place.latitude !== null &&
    place.latitude !== undefined &&
    place.latitude !== "" &&
    place.longitude !== null &&
    place.longitude !== undefined &&
    place.longitude !== "" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lon) &&
    lon >= -180 &&
    lon <= 180
  );
}

// Rule-based prototype assessment.
// These scores are not validated disaster-response thresholds.
function calculateRelocationAssessment({
  risk_level,
  hazard_type,
  total_population,
  vulnerable_people,
}) {
  const riskBase = {
    Red: 55,
    Orange: 40,
    Yellow: 25,
    Green: 10,
  };

  const hazardPoints = {
    Flood: 15,
    Earthquake: 20,
    Landslide: 20,
    Cyclone: 15,
    Fire: 15,
    Other: 5,
  };

  const baseScore = riskBase[risk_level] ?? 40;
  const hazardScore = hazardPoints[hazard_type] ?? 5;

  const population = Math.max(
    0,
    Number(total_population) || 0
  );

  const vulnerable = Math.max(
    0,
    Math.min(population, Number(vulnerable_people) || 0)
  );

  const vulnerableRatio =
    population > 0 ? vulnerable / population : 0;

  const vulnerabilityPoints = Math.round(
    vulnerableRatio * 20
  );

  const populationPoints =
    population >= 10000 ? 10 :
    population >= 5000 ? 7 :
    population >= 1000 ? 4 :
    population > 0 ? 1 : 0;

  const risk_score = Math.min(
    100,
    baseScore +
      hazardScore +
      vulnerabilityPoints +
      populationPoints
  );

  let relocation_priority;
  let relocation_recommendation;

  if (risk_level === "Red" || risk_score >= 75) {
    relocation_priority = "Immediate";
    relocation_recommendation =
      "Urgent field assessment and evacuation planning recommended.";
  } else if (risk_score >= 55) {
    relocation_priority = "Short-term";
    relocation_recommendation =
      "Prioritize field assessment and prepare relocation arrangements.";
  } else if (risk_score >= 35) {
    relocation_priority = "Medium-term";
    relocation_recommendation =
      "Review vulnerable habitation and prepare a relocation plan.";
  } else {
    relocation_priority = "Monitor";
    relocation_recommendation =
      "Continue monitoring and reassess if conditions change.";
  }

  return {
    risk_score,
    relocation_priority,
    relocation_recommendation,
    immediate_relocation_required:
      relocation_priority === "Immediate",
  };
}

// Add a vulnerable habitation (admin only)
router.post("/habitations", protect, adminOnly, async (req, res) => {
  try {
    const {
      habitation_name,
      location,
      city,
      state,
      latitude,
      longitude,
      total_population,
      vulnerable_people,
      hazard_type,
      risk_level,
      immediate_relocation_required,
      notes,
    } = req.body;

    if (
      !habitation_name ||
      !location ||
      !city ||
      !state ||
      latitude === undefined ||
      longitude === undefined ||
      total_population === undefined ||
      vulnerable_people === undefined ||
      !hazard_type
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required habitation details.",
      });
    }

    const population = Number(total_population);
    const vulnerable = Number(vulnerable_people);
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(population) ||
      !Number.isFinite(vulnerable) ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      !Number.isInteger(population) ||
      !Number.isInteger(vulnerable) ||
      population < 0 ||
      vulnerable < 0 ||
      vulnerable > population ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Check population, vulnerable people and coordinates.",
      });
    }

    const assessedRiskLevel = risk_level || "Orange";

    const assessment = calculateRelocationAssessment({
      risk_level: assessedRiskLevel,
      hazard_type,
      total_population: population,
      vulnerable_people: vulnerable,
    });

    const manualImmediate =
      immediate_relocation_required === true ||
      immediate_relocation_required === "true";

    const finalAssessment = manualImmediate
      ? {
          ...assessment,
          relocation_priority: "Immediate",
          relocation_recommendation:
            "Marked for immediate relocation by an administrator. Verify through official field assessment.",
          immediate_relocation_required: true,
        }
      : assessment;

    const habitation = await VulnerableHabitation.create({
      habitation_name,
      location,
      city,
      state,
      latitude: lat,
      longitude: lng,
      total_population: population,
      vulnerable_people: vulnerable,
      hazard_type,
      risk_level: assessedRiskLevel,
      risk_score: finalAssessment.risk_score,
      relocation_priority: finalAssessment.relocation_priority,
      relocation_recommendation:
        finalAssessment.relocation_recommendation,
      immediate_relocation_required:
        finalAssessment.immediate_relocation_required,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Habitation added successfully.",
      habitation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Add habitation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add habitation.",
    });
  }
});

// Get hazard zones, relocation requirements and shelter capacity
router.get("/overview", protect, adminOnly, async (req, res) => {
  try {
    const storedHabitations = await VulnerableHabitation.find()
      .sort({ createdAt: -1 })
      .lean();

    // Recalculate missing/default scores for legacy records in the response.
    // This does not write to MongoDB or alter existing priority decisions.
    const habitations = storedHabitations.map((item) => {
      if (Number(item.risk_score) > 0) {
        return item;
      }

      const assessment = calculateRelocationAssessment({
        risk_level: item.risk_level,
        hazard_type: item.hazard_type,
        total_population: item.total_population,
        vulnerable_people: item.vulnerable_people,
      });

      return {
        ...item,
        risk_score: assessment.risk_score,
      };
    });

    const reports = await DisasterReport.find({
      status: { $nin: ["Resolved", "Rejected"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const shelters = await Shelter.find().lean();

    const availableShelters = shelters
      .filter((shelter) => shelter.status === "Open")
      .map((shelter) => ({
        shelter_name: shelter.shelter_name,
        capacity: Number(shelter.capacity) || 0,
        occupied: Number(shelter.occupied) || 0,
        available_capacity: Math.max(
          0,
          (Number(shelter.capacity) || 0) -
            (Number(shelter.occupied) || 0)
        ),
        location: shelter.location,
        city: shelter.city,
        latitude: shelter.latitude,
        longitude: shelter.longitude,
      }));

    const totalPopulation = habitations.reduce(
      (sum, item) => sum + (Number(item.total_population) || 0),
      0
    );

    const vulnerablePeople = habitations.reduce(
      (sum, item) => sum + (Number(item.vulnerable_people) || 0),
      0
    );
    
const habitationsWithShelterAssessment = habitations.map(
  (habitation) => {
    if (!hasValidCoordinates(habitation)) {
      return {
        ...habitation,
        nearest_available_shelter: null,
        shelter_distance_km: null,
        shelter_capacity_sufficient: false,
      };
    }

    const candidates = availableShelters
      .filter(
        (shelter) =>
          Number(shelter.available_capacity) > 0 &&
          hasValidCoordinates(shelter)
      )
      .map((shelter) => ({
        ...shelter,
        distance_km: calculateDistanceKm(
          Number(habitation.latitude),
          Number(habitation.longitude),
          Number(shelter.latitude),
          Number(shelter.longitude)
        ),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    const nearest = candidates[0];

    return {
      ...habitation,
      nearest_available_shelter: nearest
        ? {
            shelter_name: nearest.shelter_name,
            location: nearest.location,
            city: nearest.city,
            available_capacity: nearest.available_capacity,
          }
        : null,
      shelter_distance_km: nearest
        ? Number(nearest.distance_km.toFixed(2))
        : null,
      shelter_capacity_sufficient: nearest
        ? nearest.available_capacity >=
          Number(habitation.total_population)
        : false,
    };
  }
);

    const availableShelterCapacity = availableShelters.reduce(
      (sum, shelter) => sum + shelter.available_capacity,
      0
    );

    const redZones = habitations.filter(
      (item) => item.risk_level === "Red"
    );

   
  const relocationRequired = habitations.filter(
  (item) =>
    item.immediate_relocation_required === true ||
    ["Immediate", "Short-term"].includes(
      item.relocation_priority
    )
);


    const relocationPopulation = relocationRequired.reduce(
      (sum, item) => sum + (Number(item.total_population) || 0),
      0
    );

    const estimatedCapacityGap = Math.max(
      0,
      relocationPopulation - availableShelterCapacity
    );

    return res.json({
      success: true,

      summary: {
        total_habitations: habitations.length,
        total_population: totalPopulation,
        vulnerable_people: vulnerablePeople,
        active_disaster_reports: reports.length,
        red_zone_count: redZones.length,
        relocation_required_count: relocationRequired.length,
        relocation_population: relocationPopulation,
        available_shelter_capacity: availableShelterCapacity,
        estimated_capacity_gap: estimatedCapacityGap,
      },

      habitations: habitationsWithShelterAssessment ,
      active_reports: reports,
      red_zones: redZones,
      relocation_required: relocationRequired,
      available_shelters: availableShelters,
    });
  } catch (error) {
    console.error("Hazard planning overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load hazard planning overview.",
    });
  }
});

// Citizen-facing hazard and shelter information
router.get("/citizen-overview", protect, async (req, res) => {
  try {
    const habitations = await VulnerableHabitation.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const shelters = await Shelter.find({ status: "Open" })
      .sort({ city: 1, shelter_name: 1 })
      .lean();

    const sheltersWithAvailability = shelters.map((shelter) => ({
      ...shelter,
      available_capacity: Math.max(
        0,
        (Number(shelter.capacity) || 0) -
          (Number(shelter.occupied) || 0)
      ),
    }));

    return res.json({
      success: true,
      habitations,
      shelters: sheltersWithAvailability,
      notice:
        "Planning information only. Follow official disaster-management instructions.",
    });
  } catch (error) {
    console.error("Citizen hazard overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load hazard planning information.",
    });
  }
});

module.exports = router;