const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizConfig = sequelize.define(
  'QuizConfig',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: 'default',
    },
    processingTitle: {
      type: DataTypes.STRING,
      defaultValue: 'Таны төлөвлөгөө бэлтгэгдэж байна',
    },
    processingMessages: { type: DataTypes.JSON, defaultValue: [] },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'quiz_config',
    underscored: true,
  }
);

module.exports = QuizConfig;
