const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationLog = sequelize.define(
  'NotificationLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reminderKey: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'notification_logs',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'reminder_key'],
      },
    ],
  }
);

module.exports = NotificationLog;
