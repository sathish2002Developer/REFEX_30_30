/**
 * Clears all wall_members.password values so users go through first-time setup again.
 * Run: node scripts/clear_wall_passwords.js
 */
require("dotenv").config();
const { sequelize, WallMember } = require("../models");

async function main() {
  const [count] = await WallMember.update(
    { password: null },
    { where: {} }
  );
  console.log(`Cleared password for ${count} wall user(s).`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
