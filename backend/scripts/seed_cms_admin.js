/**
 * Creates or updates the CMS admin user from data/cmsAdminSample.json
 * (bcrypt-hashed password). Safe to re-run; refreshes password to match JSON.
 */
require("dotenv").config();
const { sequelize } = require("../models");
const { ensureCmsAdminFromSample } = require("../helpers/cmsAdminSeed");

async function main() {
  await sequelize.sync({ alter: true });
  await ensureCmsAdminFromSample();
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
