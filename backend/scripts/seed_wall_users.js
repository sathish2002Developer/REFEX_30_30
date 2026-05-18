require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, WallMember } = require("../models");
const { normalizeEmail } = require("../helpers/wallMember");
const { hashWallPassword } = require("../helpers/wallPassword");

async function seed() {
  const filePath = path.join(__dirname, "../data/wallUsers.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const { users } = data;

  await sequelize.sync({ alter: true });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const u of users) {
    const email = normalizeEmail(u.email);
    if (!email) {
      skipped += 1;
      console.log(`Skipped (no email): ${u.name}`);
      continue;
    }

    const payload = {
      name: u.name.trim(),
      designation: (u.designation || "").trim(),
      team_entity: (u.team_entity || "").trim(),
      email,
      is_active: true,
    };

    const explicitPassword =
      u.password != null && String(u.password).trim() !== ""
        ? hashWallPassword(String(u.password).trim())
        : null;

    const existing = await WallMember.findOne({ where: { email } });
    if (existing) {
      const patch = { ...payload };
      if (explicitPassword && !existing.password) {
        patch.password = explicitPassword;
      }
      await existing.update(patch);
      updated += 1;
    } else {
      await WallMember.create({
        ...payload,
        password: explicitPassword,
      });
      created += 1;
    }
  }

  console.log(
    `Wall users seeded: ${created} created, ${updated} updated, ${skipped} skipped. New users have no password until first sign-in.`
  );
  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
