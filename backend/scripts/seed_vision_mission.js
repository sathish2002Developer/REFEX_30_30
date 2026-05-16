const { VisionMission, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const seedVisionMission = async () => {
  try {
    // Sync database first
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    const dataPath = path.join(__dirname, "../seeds/vision_mission.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Check if data already exists
    const existing = await VisionMission.findOne();
    if (existing) {
      console.log("Vision & Mission data already exists, skipping...");
      return;
    }

    await VisionMission.create(data);
    console.log("Vision & Mission data seeded successfully!");
  } catch (error) {
    console.error("Error seeding Vision & Mission data:", error);
  }
};

module.exports = seedVisionMission;

// Run if called directly
if (require.main === module) {
  seedVisionMission().then(() => process.exit(0));
}
