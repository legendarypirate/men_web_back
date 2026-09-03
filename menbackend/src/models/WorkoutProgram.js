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
    equipment: { type: DataTypes.STRING, allowNull: true, defaultValue: 'None' },
    tag: { type: DataTypes.STRING, defaultValue: 'ӨНӨӨДРИЙН ДАСГАЛ' },
    kind: { type: DataTypes.STRING, allowNull: false, defaultValue: 'kegel' },
    isToday: { type: DataTypes.BOOLEAN, defaultValue: false },
    isLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    challengeLevel: { type: DataTypes.INTEGER, allowNull: true },
    challengeDays: { type: DataTypes.INTEGER, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    videoUrl: { type: DataTypes.STRING, allowNull: true },
    thumbnailUrl: { type: DataTypes.STRING, allowNull: true },
    introSlides: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    levelPresets: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: 'workout_programs',
    underscored: true,
  }
);

module.exports = WorkoutProgram;
