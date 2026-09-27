const mongoose = require("mongoose");
const Resource = require("./models/Resource");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resq_db";

const resources = [
  {
    resource_name: "Emergency Food Kits",
    resource_type: "Food",
    quantity: 500,
    available_quantity: 320,
    unit: "Kits",
    location: "Central Relief Warehouse",
    city: "New Delhi",
    state: "Delhi",
    status: "Available",
    description:
      "Ready-to-distribute food kits for disaster affected citizens.",
  },

  {
    resource_name: "Drinking Water Bottles",
    resource_type: "Water",
    quantity: 2000,
    available_quantity: 1350,
    unit: "Bottles",
    location: "East Delhi Relief Store",
    city: "New Delhi",
    state: "Delhi",
    status: "Available",
    description:
      "Packaged drinking water for emergency relief operations.",
  },

  {
    resource_name: "First Aid Kits",
    resource_type: "Medical",
    quantity: 150,
    available_quantity: 85,
    unit: "Kits",
    location: "Central Emergency Store",
    city: "New Delhi",
    state: "Delhi",
    status: "Available",
    description:
      "Basic medical supplies for emergency treatment and rescue operations.",
  },

  {
    resource_name: "Oxygen Cylinders",
    resource_type: "Medical",
    quantity: 80,
    available_quantity: 42,
    unit: "Cylinders",
    location: "Emergency Medical Centre",
    city: "New Delhi",
    state: "Delhi",
    status: "Available",
    description:
      "Oxygen cylinders reserved for emergency medical support.",
  },

  {
    resource_name: "Rescue Boats",
    resource_type: "Rescue Equipment",
    quantity: 20,
    available_quantity: 8,
    unit: "Boats",
    location: "Yamuna Rescue Base",
    city: "New Delhi",
    state: "Delhi",
    status: "Allocated",
    description:
      "Inflatable rescue boats for flood and water rescue operations.",
  },

  {
    resource_name: "Emergency Blankets",
    resource_type: "Relief Supply",
    quantity: 800,
    available_quantity: 430,
    unit: "Blankets",
    location: "North Delhi Relief Warehouse",
    city: "New Delhi",
    state: "Delhi",
    status: "Available",
    description:
      "Thermal blankets for displaced citizens staying at shelters.",
  },

  {
    resource_name: "Portable Emergency Lights",
    resource_type: "Equipment",
    quantity: 100,
    available_quantity: 25,
    unit: "Units",
    location: "Disaster Response Store",
    city: "New Delhi",
    state: "Delhi",
    status: "Allocated",
    description:
      "Portable lighting equipment for night-time rescue and shelter operations.",
  },

  {
    resource_name: "Rescue Rope Sets",
    resource_type: "Rescue Equipment",
    quantity: 60,
    available_quantity: 0,
    unit: "Sets",
    location: "South Delhi Rescue Store",
    city: "New Delhi",
    state: "Delhi",
    status: "Depleted",
    description:
      "Heavy-duty rescue rope sets used during structural and flood rescue.",
  },

  {
    resource_name: "Portable Generators",
    resource_type: "Power Equipment",
    quantity: 30,
    available_quantity: 12,
    unit: "Generators",
    location: "Central Emergency Warehouse",
    city: "New Delhi",
    state: "Delhi",
    status: "Available",
    description:
      "Portable generators for emergency shelters and command centres.",
  },

  {
    resource_name: "Emergency Medical Oxygen Masks",
    resource_type: "Medical",
    quantity: 300,
    available_quantity: 175,
    unit: "Masks",
    location: "Central Medical Supply Centre",
    city: "New Delhi",
    state: "Delhi",
    status: "Available",
    description:
      "Medical oxygen masks for emergency respiratory support.",
  },
];

const seedResources = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    let added = 0;
    let skipped = 0;

    for (const resourceData of resources) {
      const existing = await Resource.findOne({
        resource_name: resourceData.resource_name,
      });

      if (existing) {
        console.log(
          `Skipped: ${resourceData.resource_name}`
        );
        skipped++;
        continue;
      }

      await Resource.create(resourceData);

      console.log(
        `Added: ${resourceData.resource_name}`
      );

      added++;
    }

    console.log("\nResource seeding completed");
    console.log(`Added: ${added}`);
    console.log(`Skipped: ${skipped}`);

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("Resource seeding failed:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedResources();