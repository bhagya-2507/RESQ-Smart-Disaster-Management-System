const Resource = require("../models/Resource");

// GET all resources
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error("Get resources error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load resources.",
    });
  }
};


// CREATE resource
const createResource = async (req, res) => {
  try {
    const {
      resource_name,
      resource_type,
      quantity,
      unit,
      location,
      city,
      state,
      description,
    } = req.body;

    if (
      !resource_name ||
      !resource_type ||
      quantity === undefined ||
      !unit ||
      !location ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required resource fields.",
      });
    }

    const totalQuantity = Number(quantity);

    if (!Number.isFinite(totalQuantity) || totalQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-negative number.",
      });
    }

    const resource = await Resource.create({
      resource_name: resource_name.trim(),
      resource_type: resource_type.trim(),
      quantity: totalQuantity,
      available_quantity: totalQuantity,
      unit: unit.trim(),
      location: location.trim(),
      city: city.trim(),
      state: state.trim(),
      status: totalQuantity === 0 ? "Depleted" : "Available",
      description: description?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Resource added successfully.",
      resource,
    });
  } catch (error) {
    console.error("Create resource error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add resource.",
    });
  }
};


// UPDATE resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    const {
      resource_name,
      resource_type,
      quantity,
      available_quantity,
      unit,
      location,
      city,
      state,
      status,
      description,
    } = req.body;

    if (resource_name !== undefined) resource.resource_name = resource_name.trim();
    if (resource_type !== undefined) resource.resource_type = resource_type.trim();
    if (unit !== undefined) resource.unit = unit.trim();
    if (location !== undefined) resource.location = location.trim();
    if (city !== undefined) resource.city = city.trim();
    if (state !== undefined) resource.state = state.trim();
    if (description !== undefined) resource.description = description.trim();

    if (quantity !== undefined) {
      const newQuantity = Number(quantity);

      if (!Number.isFinite(newQuantity) || newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a valid non-negative number.",
        });
      }

      resource.quantity = newQuantity;
    }

    if (available_quantity !== undefined) {
      const available = Number(available_quantity);

      if (!Number.isFinite(available) || available < 0) {
        return res.status(400).json({
          success: false,
          message: "Available quantity must be a valid non-negative number.",
        });
      }

      resource.available_quantity = available;
    }

    if (resource.available_quantity > resource.quantity) {
      return res.status(400).json({
        success: false,
        message: "Available quantity cannot exceed total quantity.",
      });
    }

    if (status !== undefined) {
      const allowedStatuses = ["Available", "Allocated", "Depleted"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid resource status.",
        });
      }

      resource.status = status;
    } else {
      if (resource.available_quantity === 0) {
        resource.status = "Depleted";
      } else if (resource.available_quantity < resource.quantity) {
        resource.status = "Allocated";
      } else {
        resource.status = "Available";
      }
    }

    await resource.save();

    return res.status(200).json({
      success: true,
      message: "Resource updated successfully.",
      resource,
    });
  } catch (error) {
    console.error("Update resource error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update resource.",
    });
  }
};


// DELETE resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error("Delete resource error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete resource.",
    });
  }
};


// UPDATE resource status
const updateResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Available", "Allocated", "Depleted"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource status.",
      });
    }

    const resource = await Resource.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource status updated successfully.",
      resource,
    });
  } catch (error) {
    console.error("Update resource status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update resource status.",
    });
  }
};


module.exports = {
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  updateResourceStatus,
};