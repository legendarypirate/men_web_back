const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define(
  'Article',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: true },
    author: { type: DataTypes.STRING, allowNull: true },
    readMinutes: { type: DataTypes.INTEGER, defaultValue: 5 },
    tag: { type: DataTypes.STRING, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    premium: { type: DataTypes.BOOLEAN, defaultValue: false },
    isNew: { type: DataTypes.BOOLEAN, defaultValue: false },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
    isOnboarding: { type: DataTypes.BOOLEAN, defaultValue: false },
    storySlides: { type: DataTypes.JSON, defaultValue: [] },
    sourceTitle: { type: DataTypes.STRING, allowNull: true },
    sourcePublisher: { type: DataTypes.STRING, allowNull: true },
    sourceUrl: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'articles',
    underscored: true,
  }
);

module.exports = Article;
