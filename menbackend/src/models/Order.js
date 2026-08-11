const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ),
      defaultValue: 'pending',
    },
    totalMnt: { type: DataTypes.INTEGER, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerPhone: { type: DataTypes.STRING, allowNull: true },
    customerEmail: { type: DataTypes.STRING, allowNull: true },
    shippingAddress: { type: DataTypes.TEXT, allowNull: true },
    paymentMethod: {
      type: DataTypes.ENUM('qpay', 'cash', 'card'),
      defaultValue: 'qpay',
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'orders',
    underscored: true,
  }
);

module.exports = Order;
