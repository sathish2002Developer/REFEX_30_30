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
        unique: true,
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
    }
  );

  return CmsSiteChrome;
};
