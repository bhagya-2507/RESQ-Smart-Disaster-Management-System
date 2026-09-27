const mongoose = require("mongoose");
const Shelter = require("./models/Shelter");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resq_db";

const shelters = [
  {
    shelter_name: "Yamuna Relief Camp",
    shelter_type: "Relief Camp",
    capacity: 500,
    occupied: 185,
    location: "Mayur Vihar Phase 1",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501001",
    facilities:
      "Food, Drinking Water, Medical Aid, Toilets, Electricity",
    status: "Open",
    latitude: 28.6087,
    longitude: 77.2946,
  },

  {
    shelter_name: "Central Emergency Shelter",
    shelter_type: "Emergency Shelter",
    capacity: 300,
    occupied: 120,
    location: "Karol Bagh",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501002",
    facilities:
      "Medical Aid, Food, Water, Emergency Power, Security",
    status: "Open",
    latitude: 28.6517,
    longitude: 77.1909,
  },

  {
    shelter_name: "North Delhi Relief Centre",
    shelter_type: "Relief Camp",
    capacity: 450,
    occupied: 310,
    location: "Civil Lines",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501003",
    facilities:
      "Food, Water, Blankets, Medical Support, Toilets",
    status: "Open",
    latitude: 28.6765,
    longitude: 77.2263,
  },

  {
    shelter_name: "South Delhi Emergency Camp",
    shelter_type: "Emergency Shelter",
    capacity: 350,
    occupied: 350,
    location: "Saket",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501004",
    facilities:
      "Medical Aid, Food, Water, Power Backup, Toilets",
    status: "Full",
    latitude: 28.5244,
    longitude: 77.2066,
  },

  {
    shelter_name: "East Delhi Community Shelter",
    shelter_type: "Temporary Shelter",
    capacity: 250,
    occupied: 95,
    location: "Laxmi Nagar",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501005",
    facilities:
      "Food, Drinking Water, First Aid, Toilets",
    status: "Open",
    latitude: 28.6304,
    longitude: 77.2773,
  },

  {
    shelter_name: "Dwarka Disaster Relief Camp",
    shelter_type: "Relief Camp",
    capacity: 600,
    occupied: 275,
    location: "Dwarka Sector 10",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501006",
    facilities:
      "Food, Water, Medical Centre, Child Care, Toilets",
    status: "Open",
    latitude: 28.5815,
    longitude: 77.0580,
  },

  {
    shelter_name: "Rohini Temporary Shelter",
    shelter_type: "Temporary Shelter",
    capacity: 200,
    occupied: 72,
    location: "Rohini Sector 9",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501007",
    facilities:
      "Food, Water, Blankets, First Aid",
    status: "Open",
    latitude: 28.7160,
    longitude: 77.1170,
  },

  {
    shelter_name: "Shahdara Emergency Shelter",
    shelter_type: "Emergency Shelter",
    capacity: 400,
    occupied: 400,
    location: "Shahdara",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501008",
    facilities:
      "Medical Aid, Food, Water, Security, Toilets",
    status: "Full",
    latitude: 28.6734,
    longitude: 77.2893,
  },

  {
    shelter_name: "India Gate Relief Centre",
    shelter_type: "Relief Camp",
    capacity: 300,
    occupied: 0,
    location: "India Gate",
    city: "New Delhi",
    state: "Delhi",
    contact: "9876501009",
    facilities:
      "Food, Water, Medical Aid, Electricity, Toilets",
    status: "Open",
    latitude: 28.6129,
    longitude: 77.2295,
  },
];

const seedShelters = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    let added = 0;
    let skipped = 0;

    for (const shelterData of shelters) {
      const existing = await Shelter.findOne({
        shelter_name: shelterData.shelter_name,
      });

      if (existing) {
        console.log(
          `Skipped: ${shelterData.shelter_name}`
        );
        skipped++;
        continue;
      }

      await Shelter.create(shelterData);

      console.log(
        `Added: ${shelterData.shelter_name}`
      );

      added++;
    }

    console.log("\nShelter seeding completed");
    console.log(`Added: ${added}`);
    console.log(`Skipped: ${skipped}`);

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("Shelter seeding failed:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedShelters();