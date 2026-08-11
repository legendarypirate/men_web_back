const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutSession = sequelize.define(
  'WorkoutSession',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    programId: { type: DataTypes.STRING, allowNull: false },
    programTitle: { type: DataTypes.STRING, allowNull: false },
    durationSeconds: { type: DataTypes.INTEGER, allowNull: false },
    calories: { type: DataTypes.INTEGER, allowNull: false },
    completedSets: { type: DataTypes.INTEGER, allowNull: false },
    totalSets: { type: DataTypes.INTEGER, allowNull: false },
    consistencyPercent: { type: DataTypes.INTEGER, allowNull: false },
    earlyFinish: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: 'workout_sessions',
    underscored: true,
  }
);

module.exports = WorkoutSession;
