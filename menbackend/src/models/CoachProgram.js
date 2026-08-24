const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoachProgram = sequelize.define(
  'CoachProgram',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    duration: { type: DataTypes.STRING, allowNull: false },
    exerciseCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    imageUrl: { type: DataTypes.STRING, allowNull: true },
    section: {
      type: DataTypes.ENUM('main', 'recommended', 'courses'),
      allowNull: false,
    },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'coach_programs',
    underscored: true,
  }
);

module.exports = CoachProgram;
