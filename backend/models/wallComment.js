"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallComment extends Model {
    static associate(models) {
      WallComment.belongsTo(models.WallPost, {
        foreignKey: "post_id",
        as: "post",
      });
    }
  }

  WallComment.init(
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
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: "You",
      },
      role: {
        type: DataTypes.STRING(160),
        allowNull: false,
        defaultValue: "Leader",
      },
      initials: {
        type: DataTypes.STRING(8),
        allowNull: false,
        defaultValue: "YO",
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "WallComment",
      tableName: "wall_comments",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return WallComment;
};
