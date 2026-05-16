require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, Statistic } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/statistics.json");
  let raw = fs.readFileSync(file, "utf-8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  for (const item of data) {
    const [row] = await Statistic.findOrCreate({
      where: { order: item.order, title: item.title },
      defaults: {
        title: item.title,
        value: item.value,
        description: item.description || null,
        image: item.image || null,
        color: item.color || "#2879b6",
        order: item.order || 0,
        isActive: item.isActive !== undefined ? !!item.isActive : true,
      },
    });
    await row.update({
      value: item.value,
      description: item.description || null,
      image: item.image || null,
      color: item.color || "#2879b6",
      order: item.order || 0,
      isActive: item.isActive !== undefined ? !!item.isActive : true,
    });
  }

  console.log("âœ… Seeded statistics");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("âŒ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
