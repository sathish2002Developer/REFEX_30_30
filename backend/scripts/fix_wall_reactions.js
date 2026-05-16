/**
 * Removes legacy wall_reactions rows that block the unique (post_id, wall_member_id) index.
 * Run: npm run fix:wall-reactions
 */
require("dotenv").config();
const { sequelize } = require("../models");
const { cleanupWallTables } = require("../helpers/wallDbCleanup");

cleanupWallTables(sequelize)
  .then(() => console.log("Wall tables cleaned (legacy + duplicate rows)"))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => {
    console.log("Database synced successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
