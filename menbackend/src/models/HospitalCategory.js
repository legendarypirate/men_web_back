const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HospitalCategory = sequelize.define(
  'HospitalCategory',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    icon: { type: DataTypes.STRING, defaultValue: 'medical_services_outlined' },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'hospital_categories',
    underscored: true,
  }
);

module.exports = HospitalCategory;
