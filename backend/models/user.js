"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });
      User.belongsTo(models.User, {
        foreignKey: "modified_by",
        as: "modifier",
      });
      User.belongsTo(models.User, {
        foreignKey: "deleted_by",
        as: "deleter",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      first_name: DataTypes.STRING(85),
      last_name: DataTypes.STRING(85),
      mobile_number: DataTypes.STRING(20),
      email: DataTypes.STRING(100),
      password: DataTypes.STRING,
      api_key: DataTypes.TEXT,
      user_type: {
        type: DataTypes.ENUM("Admin", "CHRO", "HR"),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      created_by: {
        type: DataTypes.UUID,
        defaultValue: null,
      },
      modified_by: {
        type: DataTypes.UUID,
        defaultValue: null,
      },
      deleted_by: {
        type: DataTypes.UUID,
      },
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "modified_at",
      deletedAt: "deleted_at",
    }
  );
  return User;
};
