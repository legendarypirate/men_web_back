const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ArticleCategory = sequelize.define(
  'ArticleCategory',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: 'article_categories',
    underscored: true,
  }
);

module.exports = ArticleCategory;
