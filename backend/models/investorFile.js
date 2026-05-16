"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class InvestorFile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     */
    static associate(models) {
      // define association here if needed
    }
  }
  InvestorFile.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      year: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      section: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'annual-return',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'pdf',
      },
      size: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "InvestorFile",
      tableName: "investor_files",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return InvestorFile;
};

