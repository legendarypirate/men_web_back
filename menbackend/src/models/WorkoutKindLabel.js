const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutKindLabel = sequelize.define(
  'WorkoutKindLabel',
  {
    kind: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'workout_kind_labels',
    underscored: true,
  }
);

module.exports = WorkoutKindLabel;
