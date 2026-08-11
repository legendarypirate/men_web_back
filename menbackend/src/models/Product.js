const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priceMnt: { type: DataTypes.INTEGER, allowNull: false },
    category: {
      type: DataTypes.ENUM('supplements', 'devices', 'wellness', 'nutrition'),
      allowNull: false,
    },
    icon: { type: DataTypes.STRING, defaultValue: 'shopping_bag' },
    gradientStart: { type: DataTypes.STRING, defaultValue: '#0F766E' },
    gradientEnd: { type: DataTypes.STRING, defaultValue: '#14B8A6' },
    images: { type: DataTypes.JSON, defaultValue: [] },
    benefits: { type: DataTypes.JSON, defaultValue: [] },
    rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 4.5 },
    reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    inStock: { type: DataTypes.BOOLEAN, defaultValue: true },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    badge: { type: DataTypes.STRING, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'products',
    underscored: true,
  }
);

module.exports = Product;
