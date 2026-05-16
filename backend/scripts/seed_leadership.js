require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, LeadershipMember } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/leadership.json");
  let raw = fs.readFileSync(file, "utf-8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  for (const item of data) {
    const [row] = await LeadershipMember.findOrCreate({
      where: { order: item.order, name: item.name },
      defaults: {
        name: item.name,
        position: item.position,
        category: item.category,
        description: item.description || null,
        achievementsJson: JSON.stringify(item.achievements || []),
        experience: item.experience || null,
        education: item.education || null,
        image: item.image || null,
        color: item.color || "refex-blue",
        order: item.order || 0,
        isActive: item.isActive !== undefined ? !!item.isActive : true,
      },
    });
    await row.update({
      name: item.name,
      position: item.position,
      category: item.category,
      description: item.description || null,
      achievementsJson: JSON.stringify(item.achievements || []),
      experience: item.experience || null,
      education: item.education || null,
      image: item.image || null,
      color: item.color || "refex-blue",
      order: item.order || 0,
      isActive: item.isActive !== undefined ? !!item.isActive : true,
    });
  }

  console.log("âœ… Seeded leadership members");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("âŒ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});
