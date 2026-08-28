const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizStage = sequelize.define(
  'QuizStage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: { type: DataTypes.STRING, allowNull: false },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    endMediaType: {
      type: DataTypes.ENUM('none', 'image', 'video'),
      defaultValue: 'none',
    },
    endMediaUrl: { type: DataTypes.STRING, allowNull: true },
    endMediaTitle: { type: DataTypes.TEXT, allowNull: true },
    endMediaCaption: { type: DataTypes.TEXT, allowNull: true },
    endMediaItems: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    tableName: 'quiz_stages',
    underscored: true,
  }
);

module.exports = QuizStage;
