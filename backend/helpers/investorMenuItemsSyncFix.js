/**
 * MySQL permits a limited number of indexes per InnoDB table. Sequelize `alter: true` can accumulate
 * duplicate slug indexes until ALTER fails with ER_TOO_MANY_KEYS (errno 1069).
 *
 * This model only ever needs PRIMARY + one UNIQUE on slug, so before each sync we drop every
 * secondary index we can safely remove. Sequelize recreation is cheap.
 *
 * `SELECT DATABASE()` is sometimes empty on first query; fall back to the configured DB name.
 */
async function prepareInvestorMenuItemsForMysqlSync(sequelize) {
  if (sequelize.getDialect() !== "mysql") return;

  try {
    const [[dbRow]] = await sequelize.query("SELECT DATABASE() AS db");
    const schema =
      (dbRow && dbRow.db) ||
      sequelize.config?.database ||
      sequelize.connectionManager?.config?.database ||
      "";
    if (!schema || !schema.trim()) {
      console.warn(
        "[investor_menu_items sync fix] Cannot resolve database/schema name — skipping index trim."
      );
      return;
    }
    const schemaEscaped = sequelize.escape(schema);

    const [[tableRow]] = await sequelize.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ${schemaEscaped} AND TABLE_NAME = 'investor_menu_items' LIMIT 1`
    );
    if (!tableRow) return;

    const [indexes] = await sequelize.query(
      `SHOW INDEX FROM \`investor_menu_items\``
    );
    const seen = new Set();
    const indexNames = [];
    for (const row of indexes || []) {
      const n = row.Key_name ?? row.key_name;
      if (n && !seen.has(n)) {
        seen.add(n);
        indexNames.push(n);
      }
    }

    const [fkRows] = await sequelize.query(
      `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = ${schemaEscaped} AND TABLE_NAME = 'investor_menu_items'
       AND CONSTRAINT_TYPE = 'FOREIGN KEY'`
    );
    const fkNames = new Set(
      (fkRows || []).map((r) => r.CONSTRAINT_NAME ?? r.constraint_name).filter(Boolean)
    );

    let dropped = 0;
    for (const name of indexNames) {
      if (name === "PRIMARY") continue;
      if (fkNames.has(name)) continue;
      await sequelize.query(`ALTER TABLE \`investor_menu_items\` DROP INDEX \`${name}\``);
      dropped += 1;
    }

    if (dropped > 0) {
      console.warn(
        `investor_menu_items: dropped ${dropped} secondary index(es) before sync (MySQL ER_TOO_MANY_KEYS guard)`
      );
    }
  } catch (err) {
    if (err.original?.code === "ER_NO_SUCH_TABLE") return;
    throw err;
  }
}

module.exports = { prepareInvestorMenuItemsForMysqlSync };
