const Resource = require("../models/Resource");
const ResourceRequest = require("../models/ResourceRequest");


// =====================================================
// CITIZEN - CREATE RESOURCE REQUEST
// =====================================================

const createResourceRequest = async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Only citizens can request resources.",
      });
    }

    const {
      resource_id,
      quantity,
      location,
      city,
      state,
      urgency,
      description,
    } = req.body;

    if (
      !resource_id ||
      !location ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid positive number.",
      });
    }

    const resource = await Resource.findById(resource_id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    if (
      resource.available_quantity <
      requestedQuantity
    ) {
      return res.status(400).json({
        success: false,
        message: `Only ${resource.available_quantity} unit(s) currently available.`,
      });
    }

    const request = await ResourceRequest.create({
      citizen_id: req.user.id,

      resource_id: resource._id,

      resource_name: resource.resource_name,

      resource_type: resource.resource_type,

      quantity: requestedQuantity,

      location: location.trim(),

      city: city.trim(),

      state: state.trim(),

      urgency: urgency || "Medium",

      description: description?.trim() || "",

      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Resource request submitted successfully.",
      request,
    });
  } catch (error) {
    console.error(
      "Create resource request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create resource request.",
    });
  }
};

// =====================================================
// CITIZEN - AVAILABLE RESOURCE CATALOG
// =====================================================

const getAvailableResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      available_quantity: { $gt: 0 },
      status: { $in: ["Available", "Allocated"] },
    })
      .select(
        "resource_name resource_type quantity available_quantity unit location city state description status"
      )
      .sort({
        resource_name: 1,
      });

    return res.json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error(
      "Available resources error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load available resources.",
    });
  }
};
// =====================================================
// CITIZEN - MY REQUESTS
// =====================================================

const getMyResourceRequests = async (req, res) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const requests =
      await ResourceRequest.find({
        citizen_id: req.user.id,
      })
        .populate(
          "resource_id",
          "resource_name resource_type unit"
        )
        .sort({ createdAt: -1 });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "My resource requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load your resource requests.",
    });
  }
};


// =====================================================
// ADMIN - ALL REQUESTS
// =====================================================

const getAllResourceRequests = async (
  req,
  res
) => {
  try {
    const requests =
      await ResourceRequest.find()
        .populate(
          "citizen_id",
          "full_name email mobile city state"
        )
        .populate(
          "resource_id",
          "resource_name resource_type unit available_quantity status"
        )
        .sort({ createdAt: -1 });

    return res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "Admin resource requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load resource requests.",
    });
  }
};


// =====================================================
// ADMIN - UPDATE REQUEST STATUS
// =====================================================

const updateResourceRequestStatus = async (
  req,
  res
) => {
  try {
    const { status, admin_note } = req.body;

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Fulfilled",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request status.",
      });
    }

    const request =
      await ResourceRequest.findByIdAndUpdate(
        req.params.id,
        {
          status,
          admin_note:
            admin_note?.trim() || "",
        },
        {
          returnDocument: "after",
        }
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Resource request not found.",
      });
    }

    return res.json({
      success: true,
      message:
        "Resource request status updated.",
      request,
    });
  } catch (error) {
    console.error(
      "Update resource request status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update resource request.",
    });
  }
};


// =====================================================
// ADMIN - ALLOCATE RESOURCE
// =====================================================


const allocateResource = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Resource request not found.",
      });
    }

    // Allocation is allowed only after admin approval
    if (request.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message:
          "Only approved requests can be allocated.",
      });
    }

    const resource = await Resource.findById(
      request.resource_id
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    // Check current available quantity
    if (
      resource.available_quantity < request.quantity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough resource quantity available.",
      });
    }

    // Reduce available quantity
    resource.available_quantity =
      resource.available_quantity - request.quantity;

    // Update resource inventory status
    resource.status =
      resource.available_quantity === 0
        ? "Depleted"
        : "Allocated";

    await resource.save();

    // Update citizen request
    request.status = "Allocated";
    request.allocated_at = new Date();

    await request.save();

    return res.json({
      success: true,
      message:
        "Resource allocated successfully.",
      request,
      resource,
    });
  } catch (error) {
    console.error(
      "Allocate resource error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to allocate resource.",
    });
  }
};


module.exports = {
  createResourceRequest,
  getAvailableResources,
  getMyResourceRequests,
  getAllResourceRequests,
  updateResourceRequestStatus,
  allocateResource,
};