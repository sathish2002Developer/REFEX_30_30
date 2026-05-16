"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallPollVote extends Model {
    static associate(models) {
      WallPollVote.belongsTo(models.WallPost, {
        foreignKey: "post_id",
        as: "post",
      });
      WallPollVote.belongsTo(models.WallPollOption, {
        foreignKey: "poll_option_id",
        as: "option",
      });
    }
  }

  WallPollVote.init(
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
      poll_option_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      wall_member_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: "",
      },
      initials: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "WallPollVote",
      tableName: "wall_poll_votes",
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["post_id", "wall_member_id"],
        },
      ],
    }
  );

  return WallPollVote;
};
