const DisasterAlert = require("../models/DisasterAlert");

// GET all alerts
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await DisasterAlert.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("Get alerts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load alerts.",
    });
  }
};


// CREATE alert
const createAlert = async (req, res) => {
  try {
    const {
      title,
      alert_type,
      severity,
      message,
      location,
      city,
      state,
      issued_by,
      expires_at,
      latitude,
      longitude,
    } = req.body;

    if (
      !title ||
      !alert_type ||
      !message ||
      !location ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required alert fields.",
      });
    }

    let expiryDate = null;

    if (expires_at) {
      expiryDate = new Date(expires_at);

      if (Number.isNaN(expiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date.",
        });
      }

      if (expiryDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in the future.",
        });
      }
    }

    const alert = await DisasterAlert.create({
      title: title.trim(),
      alert_type: alert_type.trim(),
      severity: severity || "High",
      message: message.trim(),
      location: location.trim(),
      city: city.trim(),
      state: state.trim(),
      issued_by: issued_by?.trim() || "RESQ Command Center",
      expires_at: expiryDate,
      latitude:
        latitude === "" || latitude === undefined
          ? null
          : Number(latitude),
      longitude:
        longitude === "" || longitude === undefined
          ? null
          : Number(longitude),
      status: "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Emergency alert created successfully.",
      alert,
    });
  } catch (error) {
    console.error("Create alert error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create alert.",
    });
  }
};


// UPDATE alert
const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await DisasterAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    const {
      title,
      alert_type,
      severity,
      message,
      location,
      city,
      state,
      issued_by,
      status,
      expires_at,
      latitude,
      longitude,
    } = req.body;

    if (title !== undefined) {
      alert.title = title.trim();
    }

    if (alert_type !== undefined) {
      alert.alert_type = alert_type.trim();
    }

    if (message !== undefined) {
      alert.message = message.trim();
    }

    if (location !== undefined) {
      alert.location = location.trim();
    }

    if (city !== undefined) {
      alert.city = city.trim();
    }

    if (state !== undefined) {
      alert.state = state.trim();
    }

    if (issued_by !== undefined) {
      alert.issued_by = issued_by.trim();
    }

    if (severity !== undefined) {
      const allowedSeverity = [
        "Critical",
        "High",
        "Medium",
        "Low",
      ];

      if (!allowedSeverity.includes(severity)) {
        return res.status(400).json({
          success: false,
          message: "Invalid alert severity.",
        });
      }

      alert.severity = severity;
    }

    if (expires_at !== undefined) {
      if (expires_at === "") {
        alert.expires_at = null;
      } else {
        const expiryDate = new Date(expires_at);

        if (Number.isNaN(expiryDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid expiry date.",
          });
        }

        alert.expires_at = expiryDate;
      }
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "Active",
        "Expired",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid alert status.",
        });
      }

      alert.status = status;
    }

    if (latitude !== undefined) {
      alert.latitude =
        latitude === "" ? null : Number(latitude);
    }

    if (longitude !== undefined) {
      alert.longitude =
        longitude === "" ? null : Number(longitude);
    }

    await alert.save();

    return res.status(200).json({
      success: true,
      message: "Alert updated successfully.",
      alert,
    });
  } catch (error) {
    console.error("Update alert error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update alert.",
    });
  }
};


// DELETE alert
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await DisasterAlert.findByIdAndDelete(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alert deleted successfully.",
    });
  } catch (error) {
    console.error("Delete alert error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete alert.",
    });
  }
};


// UPDATE alert status
const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Active",
      "Expired",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid alert status.",
      });
    }

    const alert = await DisasterAlert.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alert status updated successfully.",
      alert,
    });
  } catch (error) {
    console.error(
      "Update alert status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update alert status.",
    });
  }
};


module.exports = {
  getAllAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  updateAlertStatus,
};