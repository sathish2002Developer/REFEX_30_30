"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CmsHomeHero extends Model {}

  CmsHomeHero.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      singleton_key: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: "home",
      },
      top_label: { type: DataTypes.TEXT, allowNull: true },
      title_left: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "30" },
      title_middle: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "BY" },
      title_right: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "30" },
      tagline_plain: { type: DataTypes.TEXT, allowNull: true },
      tagline_emphasis: { type: DataTypes.TEXT, allowNull: true },
      subtitle_upper: { type: DataTypes.TEXT, allowNull: true },
      quote_text: { type: DataTypes.TEXT, allowNull: true },
      hashtags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      ctas: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      background_image_url: { type: DataTypes.STRING(2048), allowNull: true },
      overlay_opacity: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 40,
      },
      radial_glow_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      radial_glow_strength_percent: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 12,
      },
      particles_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      particle_canvas_opacity_percent: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 70,
      },
      floating_orbs_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      rings_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ring_rotate_seconds: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 40,
      },
      ring_reverse_seconds: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 30,
      },
      corner_decorations_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      stagger_animations_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      scroll_indicator_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      page_extras: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CmsHomeHero",
      tableName: "cms_home_hero",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          name: "cms_home_hero_singleton_key",
          fields: ["singleton_key"],
        },
      ],
    }
  );

  return CmsHomeHero;
};
