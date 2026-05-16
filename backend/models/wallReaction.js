"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallReaction extends Model {
    static associate(models) {
      WallReaction.belongsTo(models.WallPost, {
        foreignKey: "post_id",
        as: "post",
      });
    }
  }

  WallReaction.init(
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
      wall_member_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      emoji: {
        type: DataTypes.STRING(16),
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
      modelName: "WallReaction",
      tableName: "wall_reactions",
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

  return WallReaction;
};
