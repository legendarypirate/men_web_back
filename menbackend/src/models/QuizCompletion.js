const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizCompletion = sequelize.define(
  'QuizCompletion',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    source: {
      type: DataTypes.ENUM('web', 'app'),
      allowNull: false,
      defaultValue: 'web',
    },
  },
  {
    tableName: 'quiz_completions',
    underscored: true,
  }
);

module.exports = QuizCompletion;
