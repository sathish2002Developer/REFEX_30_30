"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CmsWallPage extends Model {}

  CmsWallPage.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      singleton_key: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: "main",
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CmsWallPage",
      tableName: "cms_wall_page",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          name: "cms_wall_page_singleton_key",
          fields: ["singleton_key"],
        },
      ],
    }
  );

  return CmsWallPage;
};
