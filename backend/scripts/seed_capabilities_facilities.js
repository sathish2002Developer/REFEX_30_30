require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, CapabilitiesFacility } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/capabilities_facilities.json");
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));

  await sequelize.authenticate();
  await sequelize.sync();

  // Upsert by name
  for (const item of data) {
    const [row] = await CapabilitiesFacility.findOrCreate({
      where: { name: item.name },
      defaults: {
        name: item.name,
        type: item.type,
        established: item.established,
        location: item.location,
        capacity: item.capacity,
        color: item.color,
        image: item.image,
        capabilities: item.capabilities,
        approvals: item.approvals,
        description: item.description,
        order: item.order,
        isActive: !!item.isActive,
      },
    });
    if (row) {
      await row.update({
        type: item.type,
        established: item.established,
        location: item.location,
        capacity: item.capacity,
        color: item.color,
        image: item.image,
        capabilities: item.capabilities,
        approvals: item.approvals,
        description: item.description,
        order: item.order,
        isActive: !!item.isActive,
      });
    }
  }

  console.log("✅ Seeded capabilities facilities");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
