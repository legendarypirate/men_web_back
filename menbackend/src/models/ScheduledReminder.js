const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScheduledReminder = sequelize.define(
  'ScheduledReminder',
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
    type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'partial_complete',
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cancelled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'scheduled_reminders',
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['scheduled_for'] },
      { fields: ['sent', 'cancelled'] },
    ],
  }
);

module.exports = ScheduledReminder;
