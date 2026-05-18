"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CmsVisionPage extends Model {}

  CmsVisionPage.init(
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
      modelName: "CmsVisionPage",
      tableName: "cms_vision_page",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          name: "cms_vision_page_singleton_key",
          fields: ["singleton_key"],
        },
      ],
    }
  );

  return CmsVisionPage;
};
