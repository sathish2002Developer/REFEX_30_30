"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    static associate(models) {
      LoginHistory.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  LoginHistory.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "LoginHistory",
      tableName: "login_histories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
    }
  );

  return LoginHistory;
};
