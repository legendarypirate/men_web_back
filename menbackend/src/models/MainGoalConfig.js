const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MainGoalConfig = sequelize.define(
  'MainGoalConfig',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: 'default',
    },
    screenTitle: {
      type: DataTypes.STRING,
      defaultValue: 'Үндсэн зорилгоо сонгоно уу',
    },
    defaultKey: {
      type: DataTypes.STRING,
      defaultValue: 'erectile_function',
    },
  },
  {
    tableName: 'main_goal_config',
    underscored: true,
  }
);

module.exports = MainGoalConfig;
