const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OnboardingStorySetting = sequelize.define(
  'OnboardingStorySetting',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: 'default',
    },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    headerTitle: { type: DataTypes.STRING, defaultValue: 'Tenkhee' },
    headerSubtitle: {
      type: DataTypes.STRING,
      defaultValue: 'Танилцуулга',
    },
    finalButtonLabel: {
      type: DataTypes.STRING,
      defaultValue: 'Эхлэх',
    },
    slides: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    tableName: 'onboarding_story_settings',
    underscored: true,
  }
);

module.exports = OnboardingStorySetting;
