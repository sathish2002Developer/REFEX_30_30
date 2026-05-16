const { FooterSection, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const seedFooterSection = async () => {
  try {
    // Sync database first
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    const dataPath = path.join(__dirname, "../seeds/footer_section.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Check if data already exists
    const existing = await FooterSection.findOne();
    if (existing) {
      console.log("Footer Section data already exists, skipping...");
      return;
    }

    await FooterSection.create(data);
    console.log("Footer Section data seeded successfully!");
  } catch (error) {
    console.error("Error seeding Footer Section data:", error);
  }
};

module.exports = seedFooterSection;

// Run if called directly
if (require.main === module) {
  seedFooterSection().then(() => process.exit(0));
}
