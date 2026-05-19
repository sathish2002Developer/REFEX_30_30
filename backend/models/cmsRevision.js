"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CmsRevision extends Model {}

  CmsRevision.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      resource_type: {
        type: DataTypes.STRING(32),
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
      modelName: "CmsRevision",
      tableName: "cms_revisions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          name: "cms_revisions_resource_version",
          fields: ["resource_type", "version_number"],
        },
        {
          name: "cms_revisions_resource_created",
          fields: ["resource_type", "created_at"],
        },
      ],
    }
  );

  return CmsRevision;
};
