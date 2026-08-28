const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizQuestion = sequelize.define(
  'QuizQuestion',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    stageId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    options: { type: DataTypes.JSON, defaultValue: [] },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'quiz_questions',
    underscored: true,
  }
);

module.exports = QuizQuestion;
