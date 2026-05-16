require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, SdgCard } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/sdg_cards.json");
  let raw = fs.readFileSync(file, "utf-8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1); // Strip BOM
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  for (const item of data) {
    const [row] = await SdgCard.findOrCreate({
      where: { number: item.number },
      defaults: {
        number: item.number,
        title: item.title,
        contribution: item.contribution,
        icon: item.icon,
        color: item.color,
        order: item.order || 0,
        isActive: item.isActive !== undefined ? !!item.isActive : true,
      },
    });
    
    await row.update({
      title: item.title,
      contribution: item.contribution,
      icon: item.icon,
      color: item.color,
      order: item.order || 0,
      isActive: item.isActive !== undefined ? !!item.isActive : true,
    });
  }

  console.log("✅ Seeded SDG cards");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
