const Shelter = require("../models/Shelter");

// GET all shelters
const getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find().sort({ createdAt: -1 });

    const formattedShelters = shelters.map((shelter) => ({
      ...shelter.toObject(),
      available_capacity: Math.max(
        0,
        shelter.capacity - shelter.occupied
      ),
    }));

    return res.status(200).json({
      success: true,
      shelters: formattedShelters,
    });
  } catch (error) {
    console.error("Get shelters error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load shelters.",
    });
  }
};


// CREATE shelter
const createShelter = async (req, res) => {
  try {
    const {
      shelter_name,
      shelter_type,
      capacity,
      occupied,
      location,
      city,
      state,
      contact,
      facilities,
      latitude,
      longitude,
    } = req.body;

    if (
      !shelter_name ||
      capacity === undefined ||
      !location ||
      !city ||
      !state ||
      !contact
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required shelter fields.",
      });
    }

    if (!/^[0-9]{10}$/.test(String(contact))) {
      return res.status(400).json({
        success: false,
        message: "Contact number must contain exactly 10 digits.",
      });
    }

    const totalCapacity = Number(capacity);
    const occupiedPeople =
      occupied === undefined || occupied === ""
        ? 0
        : Number(occupied);

    if (
      !Number.isFinite(totalCapacity) ||
      totalCapacity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be at least 1.",
      });
    }

    if (
      !Number.isFinite(occupiedPeople) ||
      occupiedPeople < 0 ||
      occupiedPeople > totalCapacity
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Occupied people cannot exceed shelter capacity.",
      });
    }

    const shelter = await Shelter.create({
      shelter_name: shelter_name.trim(),
      shelter_type: shelter_type || "Relief Camp",
      capacity: totalCapacity,
      occupied: occupiedPeople,
      location: location.trim(),
      city: city.trim(),
      state: state.trim(),
      contact: String(contact),
      facilities: facilities?.trim() || "",
      status:
        occupiedPeople >= totalCapacity
          ? "Full"
          : "Open",
      latitude:
        latitude === "" ||
        latitude === undefined
          ? null
          : Number(latitude),
      longitude:
        longitude === "" ||
        longitude === undefined
          ? null
          : Number(longitude),
    });

    return res.status(201).json({
      success: true,
      message: "Shelter added successfully.",
      shelter,
    });
  } catch (error) {
    console.error("Create shelter error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add shelter.",
    });
  }
};


// UPDATE shelter
const updateShelter = async (req, res) => {
  try {
    const { id } = req.params;

    const shelter = await Shelter.findById(id);

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found.",
      });
    }

    const {
      shelter_name,
      shelter_type,
      capacity,
      occupied,
      location,
      city,
      state,
      contact,
      facilities,
      status,
      latitude,
      longitude,
    } = req.body;

    if (shelter_name !== undefined) {
      shelter.shelter_name = shelter_name.trim();
    }

    if (shelter_type !== undefined) {
      shelter.shelter_type = shelter_type;
    }

    if (location !== undefined) {
      shelter.location = location.trim();
    }

    if (city !== undefined) {
      shelter.city = city.trim();
    }

    if (state !== undefined) {
      shelter.state = state.trim();
    }

    if (facilities !== undefined) {
      shelter.facilities = facilities.trim();
    }

    if (contact !== undefined) {
      if (!/^[0-9]{10}$/.test(String(contact))) {
        return res.status(400).json({
          success: false,
          message:
            "Contact number must contain exactly 10 digits.",
        });
      }

      shelter.contact = String(contact);
    }

    if (capacity !== undefined) {
      const newCapacity = Number(capacity);

      if (
        !Number.isFinite(newCapacity) ||
        newCapacity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be at least 1.",
        });
      }

      shelter.capacity = newCapacity;
    }

    if (occupied !== undefined) {
      const newOccupied = Number(occupied);

      if (
        !Number.isFinite(newOccupied) ||
        newOccupied < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Occupied people cannot be negative.",
        });
      }

      shelter.occupied = newOccupied;
    }

    if (shelter.occupied > shelter.capacity) {
      return res.status(400).json({
        success: false,
        message:
          "Occupied people cannot exceed shelter capacity.",
      });
    }

    if (latitude !== undefined) {
      shelter.latitude =
        latitude === "" ? null : Number(latitude);
    }

    if (longitude !== undefined) {
      shelter.longitude =
        longitude === "" ? null : Number(longitude);
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "Open",
        "Full",
        "Closed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shelter status.",
        });
      }

      shelter.status = status;
    } else {
      shelter.status =
        shelter.occupied >= shelter.capacity
          ? "Full"
          : "Open";
    }

    await shelter.save();

    return res.status(200).json({
      success: true,
      message: "Shelter updated successfully.",
      shelter,
    });
  } catch (error) {
    console.error("Update shelter error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update shelter.",
    });
  }
};


// DELETE shelter
const deleteShelter = async (req, res) => {
  try {
    const { id } = req.params;

    const shelter = await Shelter.findByIdAndDelete(id);

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shelter deleted successfully.",
    });
  } catch (error) {
    console.error("Delete shelter error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete shelter.",
    });
  }
};


// UPDATE shelter status
const updateShelterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Open",
      "Full",
      "Closed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shelter status.",
      });
    }

    const shelter = await Shelter.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!shelter) {
      return res.status(404).json({
        success: false,
        message: "Shelter not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shelter status updated successfully.",
      shelter,
    });
  } catch (error) {
    console.error(
      "Update shelter status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update shelter status.",
    });
  }
};

const getAvailableShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find({
      status: "Open",
    }).sort({ createdAt: -1 });

    const availableShelters = shelters
      .map((shelter) => {
        const shelterData = shelter.toObject();

        shelterData.available_capacity = Math.max(
          0,
          shelter.capacity - shelter.occupied
        );

        return shelterData;
      })
      .filter((shelter) => shelter.available_capacity > 0);

    res.status(200).json({
      success: true,
      shelters: availableShelters,
    });
  } catch (error) {
    console.error("Available shelters error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load available shelters.",
    });
  }
};

module.exports = {
  getAllShelters,
  createShelter,
  updateShelter,
  deleteShelter,
  updateShelterStatus,
  getAvailableShelters,
};