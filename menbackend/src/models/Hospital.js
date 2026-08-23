const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospital = sequelize.define(
  'Hospital',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    openHours: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    doctors: { type: DataTypes.JSON, defaultValue: [] },
    services: { type: DataTypes.JSON, defaultValue: [] },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'hospitals',
    underscored: true,
  }
);

module.exports = Hospital;
