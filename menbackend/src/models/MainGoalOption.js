const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MainGoalOption = sequelize.define(
  'MainGoalOption',
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'main_goal_options',
    underscored: true,
  }
);

module.exports = MainGoalOption;
