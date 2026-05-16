"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallLike extends Model {
    static associate(models) {
      WallLike.belongsTo(models.WallPost, {
        foreignKey: "post_id",
        as: "post",
      });
      WallLike.belongsTo(models.WallMember, {
        foreignKey: "wall_member_id",
        as: "member",
      });
    }
  }

  WallLike.init(
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
      modelName: "WallLike",
      tableName: "wall_likes",
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

  return WallLike;
};
