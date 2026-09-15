const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppVersionSettings = sequelize.define(
  'AppVersionSettings',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: 'default',
    },
    iosForceUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    iosMinVersion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1.0.0',
    },
    iosStoreUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'https://apps.apple.com/us/app/tenkhee/id6800526981',
    },
    androidForceUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    androidMinVersion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1.0.0',
    },
    androidStoreUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue:
        'https://play.google.com/store/apps/details?id=mn.vitalmen.mgl',
    },
    updateTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Шинэ хувилбар гарлаа',
    },
    updateMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue:
        'Апп-аа шинэчлэх шаардлагатай. Үргэлжлүүлэхийн тулд App Store / Play Store-оос сүүлийн хувилбарыг татаарай.',
    },
  },
  {
    tableName: 'app_version_settings',
    underscored: true,
  }
);

module.exports = AppVersionSettings;
