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
    invoiceId: { type: DataTypes.STRING, allowNull: true, unique: true },
    paymentDescription: { type: DataTypes.STRING, allowNull: true },
    qrPayload: { type: DataTypes.TEXT, allowNull: true },
    qrImage: { type: DataTypes.TEXT, allowNull: true },
    qrText: { type: DataTypes.TEXT, allowNull: true },
    bankUrls: { type: DataTypes.JSON, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    verifiedByQpay: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: 'orders',
    underscored: true,
  }
);

module.exports = Order;
