"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InvestorMenuItem extends Model {
    static associate() {}
  }
  InvestorMenuItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      has_sub_items: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "InvestorMenuItem",
      tableName: "investor_menu_items",
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ unique: true, name: "investor_menu_items_slug_uq", fields: ["slug"] }],
    }
  );
  return InvestorMenuItem;
};
