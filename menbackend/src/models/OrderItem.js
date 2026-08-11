const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.STRING, allowNull: false },
    productName: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unitPriceMnt: { type: DataTypes.INTEGER, allowNull: false },
    lineTotalMnt: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'order_items',
    underscored: true,
  }
);

module.exports = OrderItem;
