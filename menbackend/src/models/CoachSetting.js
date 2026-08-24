const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CoachSetting = sequelize.define(
  'CoachSetting',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: 'default',
    },
    screenTitle: { type: DataTypes.STRING, defaultValue: 'Explore' },
    bannerTitle: {
      type: DataTypes.STRING,
      defaultValue: 'Private Coaching Is Now Available',
    },
    bannerSubtitle: {
      type: DataTypes.TEXT,
      defaultValue: 'Expert 1:1 support is now available inside VitalMen.',
    },
    coachName: { type: DataTypes.STRING, defaultValue: 'Dr. Sarah Chen' },
    coachRole: { type: DataTypes.STRING, defaultValue: 'Sexual Health Coach' },
    coachImageUrl: { type: DataTypes.STRING, allowNull: true },
    learnMoreLabel: { type: DataTypes.STRING, defaultValue: 'Learn More' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'coach_settings',
    underscored: true,
  }
);

module.exports = CoachSetting;
