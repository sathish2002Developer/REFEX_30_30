"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WallPost extends Model {
    static associate(models) {
      WallPost.belongsTo(models.WallMember, {
        foreignKey: "wall_member_id",
        as: "author",
      });
      WallPost.hasMany(models.WallPollOption, {
        foreignKey: "post_id",
        as: "pollOptions",
        onDelete: "CASCADE",
      });
      WallPost.hasMany(models.WallComment, {
        foreignKey: "post_id",
        as: "commentsList",
        onDelete: "CASCADE",
      });
      WallPost.hasMany(models.WallReaction, {
        foreignKey: "post_id",
        as: "reactionsList",
        onDelete: "CASCADE",
      });
      WallPost.hasMany(models.WallLike, {
        foreignKey: "post_id",
        as: "likesList",
        onDelete: "CASCADE",
      });
    }
  }

  WallPost.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      wall_member_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      author_email: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: "Anonymous",
      },
      role: {
        type: DataTypes.STRING(160),
        allowNull: false,
        defaultValue: "Contributor",
      },
      initials: {
        type: DataTypes.STRING(8),
        allowNull: false,
        defaultValue: "AN",
      },
      word: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tag: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: "General",
      },
      likes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      comments_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      shares: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      saves: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      post_type: {
        type: DataTypes.ENUM(
          "text",
          "reflection",
          "sketch",
          "image",
          "vision",
          "poll"
        ),
        allowNull: false,
        defaultValue: "text",
      },
      image_url: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      sketch_url: {
        type: DataTypes.STRING(512),
        allowNull: true,
      },
      has_sketch: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_bookmarked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "WallPost",
      tableName: "wall_posts",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return WallPost;
};
