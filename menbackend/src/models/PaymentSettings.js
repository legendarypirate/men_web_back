const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentSettings = sequelize.define(
  'PaymentSettings',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: 'default',
    },
    qpayEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Хаан банк',
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '5000123456',
    },
    bankAccountName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Tenkhee LLC',
    },
    transferNote: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue:
        'Гүйлгээний утга дээр имэйл хаягаа бичнэ үү. Төлбөр баталгаажмагц таны эрх идэвхжинэ.',
    },
  },
  {
    tableName: 'payment_settings',
    timestamps: true,
  }
);

module.exports = PaymentSettings;
