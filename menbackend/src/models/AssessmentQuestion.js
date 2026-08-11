const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssessmentQuestion = sequelize.define(
  'AssessmentQuestion',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    step: { type: DataTypes.INTEGER, allowNull: false },
    totalSteps: { type: DataTypes.INTEGER, defaultValue: 9 },
    questionKey: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    helpText: { type: DataTypes.TEXT, allowNull: true },
    options: { type: DataTypes.JSON, defaultValue: [] },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'assessment_questions',
    underscored: true,
  }
);

module.exports = AssessmentQuestion;
