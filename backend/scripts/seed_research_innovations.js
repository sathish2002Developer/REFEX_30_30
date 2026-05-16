const { ResearchInnovation, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const seedResearchInnovations = async () => {
  try {
    // Sync database first
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    const dataPath = path.join(__dirname, "../seeds/research_innovations.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Check if data already exists
    const existing = await ResearchInnovation.findOne();
    if (existing) {
      console.log("Research & Innovation data already exists, skipping...");
      return;
    }

    await ResearchInnovation.bulkCreate(data);
    console.log("Research & Innovation data seeded successfully!");
  } catch (error) {
    console.error("Error seeding Research & Innovation data:", error);
  }
};

module.exports = seedResearchInnovations;

// Run if called directly
if (require.main === module) {
  seedResearchInnovations().then(() => process.exit(0));
}
