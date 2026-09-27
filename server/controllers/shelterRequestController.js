
const mongoose = require("mongoose");
const ShelterRequest = require("../models/ShelterRequest");
const Shelter = require("../models/Shelter");
const Citizen = require("../models/citizen");

// ======================================================
// CITIZEN: CREATE SHELTER REQUEST
// ======================================================

const createShelterRequest = async (req, res) => {
  try {
    const {
      shelter_id,
      people_count,
      emergency_reason,
    } = req.body;

    if (
      !shelter_id ||
      people_count === undefined ||
      !emergency_reason?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const peopleCount = Number(people_count);

    if (
      !Number.isInteger(peopleCount) ||
      peopleCount < 1 ||
      peopleCount > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "People count must be between 1 and 100.",
      });
    }

    const shelter = await Shelter.findById(shelter_id);

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found.",
      });
    }

    const availableCapacity =
      Number(shelter.capacity || 0) -
      Number(shelter.occupied || 0);

    if (
      shelter.status !== "Open" ||
      availableCapacity < peopleCount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This shelter does not have enough available capacity.",
      });
    }

    // ==================================================
    // AUTOMATICALLY FETCH LOGGED-IN CITIZEN
    // ==================================================

    const citizenId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId ||
      req.user?.citizen_id;

    const userEmail = req.user?.email
      ?.toLowerCase()
      .trim();

    let citizen = null;

    // Find citizen using login email
    if (userEmail) {
      citizen = await Citizen.findOne({
        email: userEmail,
      }).select(
        "full_name email mobile state city"
      );
    }

    // Fallback: Find citizen using ID
    if (
      !citizen &&
      citizenId &&
      mongoose.Types.ObjectId.isValid(
        String(citizenId)
      )
    ) {
      citizen = await Citizen.findById(
        citizenId
      ).select(
        "full_name email mobile state city"
      );
    }

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message:
          "Citizen profile not found. Please login again.",
      });
    }

    // Automatically use profile details
    const citizenName =
      citizen.full_name?.trim() || "";

    const citizenContact =
      String(citizen.mobile || "").trim();

    if (!citizenName || !citizenContact) {
      return res.status(400).json({
        success: false,
        message:
          "Your profile is missing name or mobile number.",
      });
    }

    // ==================================================
    // CREATE SHELTER REQUEST
    // ==================================================

    const request = await ShelterRequest.create({
      citizen_id: citizen._id,
      shelter_id: shelter._id,
      requester_name: citizenName,
      contact: citizenContact,
      people_count: peopleCount,
      emergency_reason: emergency_reason.trim(),
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Shelter request submitted successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "CREATE SHELTER REQUEST FULL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to submit shelter request.",
    });
  }
};


// ======================================================
// CITIZEN: GET OWN SHELTER REQUESTS
// ======================================================

const getMyShelterRequests = async (req, res) => {
  try {
    const citizenId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId ||
      req.user?.citizen_id;

    if (!citizenId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const requests = await ShelterRequest.find({
      citizen_id: citizenId,
    })
      .populate(
        "shelter_id",
        "shelter_name shelter_type location city state contact"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get citizen shelter requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load your shelter requests.",
    });
  }
};


// ======================================================
// ADMIN: GET ALL SHELTER REQUESTS
// ======================================================

const getAllShelterRequests = async (req, res) => {
  try {
    const requests = await ShelterRequest.find()
      .populate(
        "shelter_id",
        "shelter_name shelter_type location city state capacity occupied status"
      )
      .populate(
        "citizen_id",
        "full_name email mobile city state"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Get all shelter requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load shelter requests.",
    });
  }
};


// ======================================================
// ADMIN: UPDATE REQUEST STATUS
// ======================================================


const updateShelterRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    const allowedStatuses = [
      "Approved",
      "Rejected",
      "Checked In",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status.",
      });
    }

    const request = await ShelterRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Shelter request not found.",
      });
    }

    // ================================================
    // VALID STATUS TRANSITIONS
    // ================================================

    const validTransitions = {
      Pending: ["Approved", "Rejected", "Cancelled"],
      Approved: ["Checked In", "Cancelled"],
      "Checked In": ["Completed"],
    };

    const currentStatus = request.status;

    if (
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change status from ${currentStatus} to ${status}.`,
      });
    }

    // ================================================
    // APPROVE REQUEST
    // ================================================

    if (status === "Approved") {
      const shelter = await Shelter.findById(
        request.shelter_id
      );

      if (!shelter) {
        return res.status(404).json({
          success: false,
          message: "Shelter not found.",
        });
      }

      const availableCapacity =
        Number(shelter.capacity || 0) -
        Number(shelter.occupied || 0);

      if (
        shelter.status !== "Open" ||
        availableCapacity < request.people_count
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Insufficient shelter capacity.",
        });
      }

      request.approved_at = new Date();

      // Reserve capacity after approval
      shelter.occupied =
        Number(shelter.occupied || 0) +
        Number(request.people_count);

      await shelter.save();
    }

    // ================================================
    // UPDATE STATUS
    // ================================================

    request.status = status;
    request.admin_note = admin_note?.trim() || "";

    await request.save();

    return res.status(200).json({
      success: true,
      message:
        `Shelter request ${status.toLowerCase()} successfully.`,
      request,
    });
  } catch (error) {
    console.error(
      "Update shelter request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update shelter request.",
    });
  }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  createShelterRequest,
  getMyShelterRequests,
  getAllShelterRequests,
  updateShelterRequestStatus,
};