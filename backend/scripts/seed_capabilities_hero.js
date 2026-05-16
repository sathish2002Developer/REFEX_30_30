require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, CapabilitiesHero } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/capabilities_hero.json");
  const payload = JSON.parse(fs.readFileSync(file, "utf-8"));

  await sequelize.authenticate();
  await sequelize.sync();

  const existing = await CapabilitiesHero.findOne();
  if (existing) {
    await existing.update(payload);
    console.log("✅ Updated Capabilities Hero");
  } else {
    await CapabilitiesHero.create(payload);
    console.log("✅ Created Capabilities Hero");
  }
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});


