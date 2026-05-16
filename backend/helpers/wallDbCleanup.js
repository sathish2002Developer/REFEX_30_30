/**
 * Cleans legacy/duplicate wall rows before Sequelize adds unique indexes.
 */
async function cleanupWallTables(sequelize) {
  try {
    await sequelize.query(
      "DELETE FROM wall_reactions WHERE wall_member_id = 0 OR wall_member_id IS NULL"
    );
    await sequelize.query(`
      DELETE wr1 FROM wall_reactions wr1
      INNER JOIN wall_reactions wr2
        ON wr1.post_id = wr2.post_id
        AND wr1.wall_member_id = wr2.wall_member_id
        AND wr1.id < wr2.id
    `);
  } catch (err) {
    if (err.original?.code !== "ER_NO_SUCH_TABLE") throw err;
  }

  try {
    await sequelize.query(
      "DELETE FROM wall_poll_votes WHERE wall_member_id = 0 OR wall_member_id IS NULL"
    );
    await sequelize.query(`
      DELETE w1 FROM wall_poll_votes w1
      INNER JOIN wall_poll_votes w2
        ON w1.post_id = w2.post_id
        AND w1.wall_member_id = w2.wall_member_id
        AND w1.id < w2.id
    `);
  } catch (err) {
    if (err.original?.code !== "ER_NO_SUCH_TABLE") throw err;
  }
}

module.exports = { cleanupWallTables };
