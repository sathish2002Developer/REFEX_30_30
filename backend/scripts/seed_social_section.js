const { SocialSection, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const seedSocialSection = async () => {
  try {
    // Sync database first
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    const dataPath = path.join(__dirname, "../seeds/social_section.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Check if data already exists
    const existing = await SocialSection.findOne();
    if (existing) {
      console.log("Social Section data already exists, skipping...");
      return;
    }

    await SocialSection.create(data);
    console.log("Social Section data seeded successfully!");
  } catch (error) {
    console.error("Error seeding Social Section data:", error);
  }
};

module.exports = seedSocialSection;

// Run if called directly
if (require.main === module) {
  seedSocialSection().then(() => process.exit(0));
}
