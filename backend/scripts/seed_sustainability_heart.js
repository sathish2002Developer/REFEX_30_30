require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, SustainabilityHeart } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/sustainability_heart.json");
  let raw = fs.readFileSync(file, "utf-8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1); // Strip BOM
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  const existing = await SustainabilityHeart.findOne();
  if (existing) {
    await existing.update({
      mainTitle: data.mainTitle || null,
      mainSubtitle: data.mainSubtitle || null,
      sections: Array.isArray(data.sections) ? data.sections : [],
      commitments: Array.isArray(data.commitments) ? data.commitments : [],
      isActive: data.isActive !== undefined ? !!data.isActive : true,
    });
  } else {
    await SustainabilityHeart.create({
      mainTitle: data.mainTitle || null,
      mainSubtitle: data.mainSubtitle || null,
      sections: Array.isArray(data.sections) ? data.sections : [],
      commitments: Array.isArray(data.commitments) ? data.commitments : [],
      isActive: data.isActive !== undefined ? !!data.isActive : true,
    });
  }

  console.log("✅ Seeded sustainability heart section");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});


