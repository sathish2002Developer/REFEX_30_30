/**
 * Sequelize `alter: true` may try `ADD created_at DATETIME NOT NULL` on a non-empty
 * `login_histories` table, which fails under MySQL strict mode (no default for existing rows).
 * If timestamps are missing, drop the table so sync can recreate it cleanly.
 */
async function prepareLoginHistoriesForMysqlSync(sequelize) {
  if (sequelize.getDialect() !== "mysql") return;

  try {
    const [tables] = await sequelize.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'login_histories'`
    );
    if (!tables || !tables.length) return;

    const [cols] = await sequelize.query("SHOW COLUMNS FROM `login_histories`");
    const names = cols.map((c) => c.Field);
    const hasTimestamps = names.includes("created_at") && names.includes("updated_at");

    if (!hasTimestamps) {
      await sequelize.query("DROP TABLE IF EXISTS `login_histories`");
      console.log("login_histories: removed incomplete table (recreated on sync).");
    }
  } catch (err) {
    if (err.original?.code === "ER_NO_SUCH_TABLE") return;
    throw err;
  }
}

module.exports = { prepareLoginHistoriesForMysqlSync };
