const { DigitalSolution, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const seedDigitalSolutions = async () => {
  try {
    // Sync database first
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    const dataPath = path.join(__dirname, "../seeds/digital_solutions.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Check if data already exists
    const existing = await DigitalSolution.findOne();
    if (existing) {
      console.log("Digital Solutions data already exists, skipping...");
      return;
    }

    await DigitalSolution.bulkCreate(data);
    console.log("Digital Solutions data seeded successfully!");
  } catch (error) {
    console.error("Error seeding Digital Solutions data:", error);
  }
};

module.exports = seedDigitalSolutions;

// Run if called directly
if (require.main === module) {
  seedDigitalSolutions().then(() => process.exit(0));
}
