/**
 * cms_revisions.created_by must be UUID (CHAR(36)). Early sync may have created BIGINT.
 */
async function prepareCmsRevisionsForMysqlSync(sequelize) {
  if (sequelize.getDialect() !== "mysql") return;

  try {
    const [[tableRow]] = await sequelize.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cms_revisions' LIMIT 1`
    );
    if (!tableRow) return;

    const [[colRow]] = await sequelize.query(
      `SELECT COLUMN_TYPE AS column_type FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cms_revisions' AND COLUMN_NAME = 'created_by'`
    );
    const colType = String(colRow?.column_type || "").toLowerCase();
    if (colType && !colType.includes("char")) {
      await sequelize.query(
        "ALTER TABLE `cms_revisions` MODIFY `created_by` CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL"
      );
      console.log("[cms revisions sync fix] Altered cms_revisions.created_by to CHAR(36) UUID");
    }
  } catch (err) {
    console.warn("[cms revisions sync fix]", err.message);
  }
}

module.exports = { prepareCmsRevisionsForMysqlSync };
