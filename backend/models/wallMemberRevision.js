"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallMemberRevision extends Model {
    static associate(models) {
      WallMemberRevision.belongsTo(models.WallMember, {
        foreignKey: "wall_member_id",
        as: "member",
      });
    }
  }

  WallMemberRevision.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      wall_member_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      version_number: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      created_by_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      label: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "WallMemberRevision",
      tableName: "wall_member_revisions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          name: "wall_member_revisions_member_version",
          fields: ["wall_member_id", "version_number"],
        },
      ],
    }
  );

  return WallMemberRevision;
};
