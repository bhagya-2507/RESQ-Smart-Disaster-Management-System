const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const VulnerableHabitation = require("../models/VulnerableHabitation");
const DisasterReport = require("../models/DisasterReport");
const Shelter = require("../models/Shelter");

const router = express.Router();
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
        message: "Check population, vulnerable people and coordinates.",
      });
    }

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
      ...(risk_level ? { risk_level } : {}),
      immediate_relocation_required:
        immediate_relocation_required === true ||
        immediate_relocation_required === "true",
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

// Get hazard zones, vulnerable habitations and shelter capacity
router.get("/overview", protect, adminOnly, async (req, res) => {
  try {
    const habitations = await VulnerableHabitation.find()
      .sort({ createdAt: -1 })
      .lean();

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
        capacity: shelter.capacity,
        occupied: shelter.occupied,
        available_capacity: Math.max(
          0,
          shelter.capacity - shelter.occupied
        ),
        location: shelter.location,
        city: shelter.city,
        latitude: shelter.latitude,
        longitude: shelter.longitude,
      }));

    const totalPopulation = habitations.reduce(
      (sum, item) => sum + item.total_population,
      0
    );

    const vulnerablePeople = habitations.reduce(
      (sum, item) => sum + item.vulnerable_people,
      0
    );

    const availableShelterCapacity = availableShelters.reduce(
      (sum, shelter) => sum + shelter.available_capacity,
      0
    );

    const redZones = habitations.filter(
      (item) => item.risk_level === "Red"
    );

    const relocationRequired = habitations.filter(
      (item) => item.immediate_relocation_required
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
        available_shelter_capacity: availableShelterCapacity,
        estimated_capacity_gap: Math.max(
          0,
          relocationRequired.reduce(
            (sum, item) => sum + item.total_population,
            0
          ) - availableShelterCapacity
        ),
      },
      habitations,
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

module.exports = router;