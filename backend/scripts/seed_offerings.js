require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, Offering } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/offerings.json");
  let raw = fs.readFileSync(file, "utf-8");
  // strip BOM if present
  if (raw.charCodeAt(0) === 0xFEFF) {
    raw = raw.slice(1);
  }
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  for (const item of data) {
    const [row] = await Offering.findOrCreate({
      where: { order: item.order, title: item.title },
      defaults: {
        title: item.title,
        description: item.description || null,
        icon: item.icon || null,
        color: item.color || null,
        gradient: item.gradient || null,
        metric: item.metric || null,
        unit: item.unit || null,
        order: item.order || 0,
        isActive: item.isActive !== undefined ? !!item.isActive : true,
      },
    });
    await row.update({
      description: item.description || null,
      icon: item.icon || null,
      color: item.color || null,
      gradient: item.gradient || null,
      metric: item.metric || null,
      unit: item.unit || null,
      order: item.order || 0,
      isActive: item.isActive !== undefined ? !!item.isActive : true,
    });
  }

  console.log("✅ Seeded offerings");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
