"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallPollOption extends Model {
    static associate(models) {
      WallPollOption.belongsTo(models.WallPost, {
        foreignKey: "post_id",
        as: "post",
      });
      WallPollOption.hasMany(models.WallPollVote, {
        foreignKey: "poll_option_id",
        as: "votesList",
      });
    }
  }

  WallPollOption.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      post_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      short_label: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      votes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      sort_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "WallPollOption",
      tableName: "wall_poll_options",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return WallPollOption;
};
