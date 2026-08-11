const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    planId: { type: DataTypes.STRING, allowNull: false },
    invoiceId: { type: DataTypes.STRING, allowNull: false, unique: true },
    amountMnt: { type: DataTypes.INTEGER, allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'MNT' },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'expired', 'cancelled'),
      defaultValue: 'pending',
    },
    qrPayload: { type: DataTypes.TEXT, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'payments',
    underscored: true,
  }
);

module.exports = Payment;
