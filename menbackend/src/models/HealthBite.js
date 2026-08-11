const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthBite = sequelize.define(
  'HealthBite',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    icon: { type: DataTypes.STRING, defaultValue: 'water_drop' },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: 'health_bites',
    underscored: true,
  }
);

module.exports = HealthBite;
