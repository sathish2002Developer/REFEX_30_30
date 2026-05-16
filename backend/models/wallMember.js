"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallMember extends Model {
    static associate(models) {
      WallMember.hasMany(models.WallPost, {
        foreignKey: "wall_member_id",
        as: "posts",
      });
    }
  }

  WallMember.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      designation: {
        type: DataTypes.STRING(160),
        allowNull: false,
        defaultValue: "",
      },
      team_entity: {
        type: DataTypes.STRING(160),
        allowNull: false,
        defaultValue: "",
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: true,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "WallMember",
      tableName: "wall_members",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return WallMember;
};
