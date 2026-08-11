const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssessmentAnswer = sequelize.define(
  'AssessmentAnswer',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    step: { type: DataTypes.INTEGER, allowNull: false },
    questionKey: { type: DataTypes.STRING, allowNull: false },
    answerKey: { type: DataTypes.STRING, allowNull: false },
    answerLabel: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'assessment_answers',
    underscored: true,
  }
);

module.exports = AssessmentAnswer;
