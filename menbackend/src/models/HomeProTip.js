const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomeProTip = sequelize.define(
  'HomeProTip',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: { type: DataTypes.TEXT, allowNull: false },
    actionLabel: { type: DataTypes.STRING, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'home_pro_tips',
    underscored: true,
  }
);

module.exports = HomeProTip;
