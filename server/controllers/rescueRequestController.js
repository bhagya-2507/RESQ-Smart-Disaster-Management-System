const RescueRequest = require("../models/RescueRequest");
const Citizen = require("../models/citizen");

// =====================================================
// CREATE RESCUE REQUEST
// =====================================================

const createRescueRequest = async (req, res) => {
  try {
    const {
      emergency_type,
      location,
      city,
      state,
      people_count,
      description,
      latitude,
  longitude,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !emergency_type ||
      !location ||
      !city ||
      !state ||
      people_count === undefined ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const peopleCount = Number(people_count);

    if (!Number.isInteger(peopleCount) || peopleCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "People count must be a whole number greater than 0.",
      });
    }

    if (peopleCount > 100000) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid people count.",
      });
    }

    if (location.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a more specific emergency location.",
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must contain at least 10 characters.",
      });
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 1000 characters.",
      });
    }

    // -------------------------------------------------
    // GET CITIZEN
    // -------------------------------------------------

    const citizen = await Citizen.findById(req.user.id);

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen account not found.",
      });
    }

    // -------------------------------------------------
    // CREATE REQUEST
    // -------------------------------------------------

   const rescueRequest = await RescueRequest.create({
  citizen_id: citizen._id,

  requester_name: citizen.full_name,

  contact: citizen.mobile,

  disaster_type: emergency_type.trim(),

  severity: "High",

  location: location.trim(),

  latitude:
    latitude !== undefined && latitude !== ""
      ? Number(latitude)
      : null,

  longitude:
    longitude !== undefined && longitude !== ""
      ? Number(longitude)
      : null,

  city: city.trim(),

  state: state.trim(),

  people_count: peopleCount,

  description: description.trim(),

  status: "Pending",
});

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Emergency rescue request submitted successfully.",
      request: rescueRequest,
    });
  } catch (error) {
    console.error("Create rescue request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit rescue request.",
    });
  }
};


// =====================================================
// GET CITIZEN RESCUE REQUESTS
// =====================================================

// =====================================================
// GET CITIZEN RESCUE REQUESTS
// =====================================================

const getMyRescueRequests = async (req, res) => {
  try {
    const requests = await RescueRequest.find({
      citizen_id: req.user.id,
    })
      .populate(
        "assigned_team_id",
        "team_name team_code leader_name contact contact_number specialization location city state latitude longitude status availability"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get my rescue requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch rescue requests.",
    });
  }
};
const getAllRescueRequests = async (req, res) => {
  try {
    const requests = await RescueRequest.find()
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
    console.error("Get all rescue requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch rescue requests.",
    });
  }
};
const updateRescueRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Responding",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rescue request status.",
      });
    }

    const request =
      await RescueRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Rescue request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rescue request status updated successfully.",
      request,
    });

  } catch (error) {
    console.error(
      "Update rescue request status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update rescue request status.",
    });
  }
};
const assignRescueTeamToRequest = async (req, res) => {
  try {
    const { team_id } = req.body;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: "Rescue team is required.",
      });
    }

    const request = await RescueRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Rescue request not found.",
      });
    }

    if (request.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message: "A resolved request cannot be assigned.",
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

    request.assigned_team_id = team._id;
    request.status = "Responding";

    await request.save();

    const updatedRequest =
      await RescueRequest.findById(request._id)
        .populate(
          "citizen_id",
          "full_name email mobile city state"
        )
        .populate(
          "assigned_team_id",
          "team_name team_code leader_name contact specialization location city state latitude longitude status availability"
        );

    return res.status(200).json({
      success: true,
      message: "Rescue team assigned successfully.",
      request: updatedRequest,
    });

  } catch (error) {
    console.error(
      "Assign team to rescue request error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to assign rescue team.",
    });
  }
};

module.exports = {
  createRescueRequest,
  getMyRescueRequests,
  getAllRescueRequests,
  updateRescueRequestStatus,
  assignRescueTeamToRequest,
};