const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutProgram = sequelize.define(
  'WorkoutProgram',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    level: { type: DataTypes.STRING, allowNull: false },
    durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
    tag: { type: DataTypes.STRING, defaultValue: 'ӨНӨӨДРИЙН ДАСГАЛ' },
    isToday: { type: DataTypes.BOOLEAN, defaultValue: false },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: 'workout_programs',
    underscored: true,
  }
);

module.exports = WorkoutProgram;
