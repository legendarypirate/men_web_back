const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Хэрэглэгч',
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primaryGoal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    membership: {
      type: DataTypes.ENUM('free', 'monthly', 'yearly', 'lifetime', 'platinum'),
      defaultValue: 'free',
    },
    membershipExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    membershipStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vitalityScore: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    activeDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    streakDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    avgHoldSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    darkMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'mn',
    },
    notificationsEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Ulaanbaatar',
    },
    provider: {
      type: DataTypes.STRING,
      defaultValue: 'email',
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
  },
  {
    tableName: 'users',
    underscored: true,
  }
);

module.exports = User;
