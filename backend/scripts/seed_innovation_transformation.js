const { InnovationTransformation, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const seedInnovationTransformation = async () => {
  try {
    // Sync database first
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    const dataPath = path.join(__dirname, "../seeds/innovation_transformation.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Check if data already exists
    const existing = await InnovationTransformation.findOne();
    if (existing) {
      console.log("Innovation & Transformation data already exists, skipping...");
      return;
    }

    await InnovationTransformation.create(data);
    console.log("Innovation & Transformation data seeded successfully!");
  } catch (error) {
    console.error("Error seeding Innovation & Transformation data:", error);
  }
};

module.exports = seedInnovationTransformation;

// Run if called directly
if (require.main === module) {
  seedInnovationTransformation().then(() => process.exit(0));
}
