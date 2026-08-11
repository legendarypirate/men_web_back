const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PremiumPlan = sequelize.define(
  'PremiumPlan',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    amountMnt: { type: DataTypes.INTEGER, allowNull: false },
    periodLabel: { type: DataTypes.STRING, allowNull: false },
    features: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    highlighted: { type: DataTypes.BOOLEAN, defaultValue: false },
    badge: { type: DataTypes.STRING, allowNull: true },
    saveText: { type: DataTypes.STRING, allowNull: true },
    buttonLabel: { type: DataTypes.STRING, defaultValue: 'Сонгох' },
    useInfinity: { type: DataTypes.BOOLEAN, defaultValue: false },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: 'premium_plans',
    underscored: true,
  }
);

module.exports = PremiumPlan;
