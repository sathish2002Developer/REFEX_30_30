/**
 * CMS singleton tables use `unique: true` on singleton_key. Sequelize `alter: true` can stack
 * duplicate UNIQUE indexes until MySQL hits ER_TOO_MANY_KEYS (max 64 indexes per table).
 * Drop secondary indexes before sync; Sequelize recreates PRIMARY + one UNIQUE on singleton_key.
 */
/** Tables where Sequelize `alter: true` stacked duplicate UNIQUE indexes (MySQL max 64). */
const TABLES_TRIM_BEFORE_ALTER_SYNC = [
  "cms_home_hero",
  "cms_wall_page",
  "cms_vision_page",
  "cms_site_chrome",
  "wall_members",
];

async function resolveMysqlSchema(sequelize) {
  const [[dbRow]] = await sequelize.query("SELECT DATABASE() AS db");
  return (
    (dbRow && dbRow.db) ||
    sequelize.config?.database ||
    sequelize.connectionManager?.config?.database ||
    ""
  );
}

async function trimSecondaryIndexes(sequelize, tableName, schema) {
  const schemaEscaped = sequelize.escape(schema);
  const tableEscaped = sequelize.escape(tableName);

  const [[tableRow]] = await sequelize.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ${schemaEscaped} AND TABLE_NAME = ${tableEscaped} LIMIT 1`
  );
  if (!tableRow) return 0;

  const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);
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
     WHERE TABLE_SCHEMA = ${schemaEscaped} AND TABLE_NAME = ${tableEscaped}
     AND CONSTRAINT_TYPE = 'FOREIGN KEY'`
  );
  const fkNames = new Set(
    (fkRows || []).map((r) => r.CONSTRAINT_NAME ?? r.constraint_name).filter(Boolean)
  );

  let dropped = 0;
  for (const name of indexNames) {
    if (name === "PRIMARY") continue;
    if (fkNames.has(name)) continue;
    try {
      await sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${name}\``);
      dropped += 1;
    } catch (err) {
      const code = err.original?.errno ?? err.parent?.errno;
      if (code === 1091) continue;
      throw err;
    }
  }
  return dropped;
}

async function prepareCmsSingletonTablesForMysqlSync(sequelize) {
  if (sequelize.getDialect() !== "mysql") return;

  try {
    const schema = await resolveMysqlSchema(sequelize);
    if (!schema || !String(schema).trim()) {
      console.warn(
        "[cms singleton sync fix] Cannot resolve database/schema name — skipping index trim."
      );
      return;
    }

    for (const tableName of TABLES_TRIM_BEFORE_ALTER_SYNC) {
      const dropped = await trimSecondaryIndexes(sequelize, tableName, schema);
      if (dropped > 0) {
        console.warn(
          `${tableName}: dropped ${dropped} secondary index(es) before sync (MySQL ER_TOO_MANY_KEYS guard)`
        );
      }
    }
  } catch (err) {
    if (err.original?.code === "ER_NO_SUCH_TABLE") return;
    throw err;
  }
}

module.exports = {
  prepareCmsSingletonTablesForMysqlSync,
  TABLES_TRIM_BEFORE_ALTER_SYNC,
};
