const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutExercise = sequelize.define(
  'WorkoutExercise',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    programId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    instruction: { type: DataTypes.TEXT, allowNull: false },
    durationSeconds: { type: DataTypes.INTEGER, allowNull: false },
    sets: { type: DataTypes.INTEGER, allowNull: false },
    motion: {
      type: DataTypes.ENUM(
        'kegelHold',
        'breath',
        'coreBrace',
        'pulse',
        'pushup',
        'endurance',
        'wave'
      ),
      allowNull: false,
    },
    motionHint: { type: DataTypes.STRING, allowNull: false },
    videoUrl: { type: DataTypes.STRING, allowNull: true },
    thumbnailUrl: { type: DataTypes.STRING, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    phases: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    introSlides: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: 'workout_exercises',
    underscored: true,
  }
);

module.exports = WorkoutExercise;
