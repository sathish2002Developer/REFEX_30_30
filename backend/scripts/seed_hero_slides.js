require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, HeroSlide } = require("../models");

async function main() {
  const file = path.join(__dirname, "../seeds/hero_slides.json");
  const raw = fs.readFileSync(file, "utf-8");
  const data = JSON.parse(raw);

  await sequelize.authenticate();
  await sequelize.sync();

  // Upsert by order/title combo
  for (const item of data) {
    const [row] = await HeroSlide.findOrCreate({
      where: { order: item.order, title: item.title },
      defaults: {
        title: item.title,
        image: item.image,
        order: item.order,
        isActive: !!item.isActive,
      },
    });
    if (row) {
      await row.update({ image: item.image, isActive: !!item.isActive });
    }
  }

  console.log("✅ Seeded hero slides");
  await sequelize.close();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try { await sequelize.close(); } catch (_) {}
  process.exit(1);
});


