"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CmsSiteChrome extends Model {}

  CmsSiteChrome.init(
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
      modelName: "CmsSiteChrome",
      tableName: "cms_site_chrome",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          name: "cms_site_chrome_singleton_key",
          fields: ["singleton_key"],
        },
      ],
    }
  );

  return CmsSiteChrome;
};
