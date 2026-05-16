require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, RegulatoryApproval } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/regulatory.json");
  let raw = fs.readFileSync(file, "utf-8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  for (const item of data) {
    const [row] = await RegulatoryApproval.findOrCreate({
      where: { order: item.order, title: item.title },
      defaults: {
        icon: item.icon || null,
        title: item.title,
        description: item.description || null,
        color: item.color || "#2879b6",
        image: item.image || null,
        order: item.order || 0,
        isActive: item.isActive !== undefined ? !!item.isActive : true,
      },
    });
    await row.update({
      icon: item.icon || null,
      description: item.description || null,
      color: item.color || "#2879b6",
      image: item.image || null,
      order: item.order || 0,
      isActive: item.isActive !== undefined ? !!item.isActive : true,
    });
  }

  console.log("âœ… Seeded regulatory approvals");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("âŒ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
