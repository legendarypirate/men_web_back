const { AppVersionSettings } = require('../models');

const DEFAULT_ID = 'default';

const DEFAULTS = {
  id: DEFAULT_ID,
  iosForceUpdate: false,
  iosMinVersion: '1.0.0',
  iosStoreUrl: 'https://apps.apple.com/us/app/tenkhee/id6800526981',
  androidForceUpdate: false,
  androidMinVersion: '1.0.0',
  androidStoreUrl:
    'https://play.google.com/store/apps/details?id=mn.vitalmen.mgl',
  updateTitle: 'Шинэ хувилбар гарлаа',
  updateMessage:
    'Апп-аа шинэчлэх шаардлагатай. Үргэлжлүүлэхийн тулд App Store / Play Store-оос сүүлийн хувилбарыг татаарай.',
};

function parseVersionParts(value) {
  if (!value || typeof value !== 'string') return [0, 0, 0];
  const normalized = value.trim().split('+')[0];
  const segments = normalized.split('.').filter(Boolean);
  return segments.map((part) => {
    const digits = part.replace(/[^\d]/g, '');
    return digits ? Number.parseInt(digits, 10) : 0;
  });
}

/** Returns negative if a < b, positive if a > b, 0 if equal. */
function compareVersions(a, b) {
  const left = parseVersionParts(a);
  const right = parseVersionParts(b);
  const length = Math.max(left.length, right.length, 3);
  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function isVersionBelow(current, minimum) {
  return compareVersions(current, minimum) < 0;
}

async function getAppVersionSettings() {
  let settings = await AppVersionSettings.findByPk(DEFAULT_ID);
  if (!settings) {
    settings = await AppVersionSettings.create(DEFAULTS);
  }
  return settings;
}

function mapAppVersionSettings(settings) {
  const json = settings.toJSON();
  return {
    iosForceUpdate: json.iosForceUpdate === true,
    iosMinVersion: json.iosMinVersion || DEFAULTS.iosMinVersion,
    iosStoreUrl: json.iosStoreUrl || DEFAULTS.iosStoreUrl,
    androidForceUpdate: json.androidForceUpdate === true,
    androidMinVersion: json.androidMinVersion || DEFAULTS.androidMinVersion,
    androidStoreUrl: json.androidStoreUrl || DEFAULTS.androidStoreUrl,
    updateTitle: json.updateTitle || DEFAULTS.updateTitle,
    updateMessage: json.updateMessage || DEFAULTS.updateMessage,
  };
}

function evaluateVersionCheck(platform, currentVersion, settings) {
  const mapped = mapAppVersionSettings(settings);
  const normalizedPlatform = String(platform || '').trim().toLowerCase();
  const isIos = normalizedPlatform === 'ios';
  const isAndroid = normalizedPlatform === 'android';

  const forceEnabled = isIos
    ? mapped.iosForceUpdate
    : isAndroid
      ? mapped.androidForceUpdate
      : false;
  const minVersion = isIos
    ? mapped.iosMinVersion
    : isAndroid
      ? mapped.androidMinVersion
      : '0.0.0';
  const storeUrl = isIos
    ? mapped.iosStoreUrl
    : isAndroid
      ? mapped.androidStoreUrl
      : '';

  const version = String(currentVersion || '').trim() || '0.0.0';
  const updateRequired =
    forceEnabled && isVersionBelow(version, minVersion);

  return {
    platform: isIos ? 'ios' : isAndroid ? 'android' : normalizedPlatform,
    currentVersion: version,
    minVersion,
    forceUpdate: updateRequired,
    updateRequired,
    storeUrl,
    title: mapped.updateTitle,
    message: mapped.updateMessage,
  };
}

module.exports = {
  DEFAULTS,
  compareVersions,
  isVersionBelow,
  getAppVersionSettings,
  mapAppVersionSettings,
  evaluateVersionCheck,
};
