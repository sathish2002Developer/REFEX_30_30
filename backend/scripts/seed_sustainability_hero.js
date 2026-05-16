require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, SustainabilityHero } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/sustainability_hero.json");
  let raw = fs.readFileSync(file, "utf-8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1); // Strip BOM
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  const [row] = await SustainabilityHero.findOrCreate({
    where: { id: 1 },
    defaults: {
      title: data.title,
      description: data.description,
      backgroundImage: data.backgroundImage,
      isActive: data.isActive !== undefined ? !!data.isActive : true,
    },
  });
  
  await row.update({
    title: data.title,
    description: data.description,
    backgroundImage: data.backgroundImage,
    isActive: data.isActive !== undefined ? !!data.isActive : true,
  });

  console.log("✅ Seeded sustainability hero");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
