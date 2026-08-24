const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromoCode = sequelize.define(
  'PromoCode',
  {
    code: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    label: { type: DataTypes.STRING, allowNull: false },
    discountPercent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    coachProgramId: { type: DataTypes.STRING, allowNull: true },
    planIds: { type: DataTypes.JSON, defaultValue: [] },
    maxUses: { type: DataTypes.INTEGER, allowNull: true },
    usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'promo_codes',
    underscored: true,
  }
);

module.exports = PromoCode;
