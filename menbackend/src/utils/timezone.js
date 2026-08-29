const { DateTime } = require('luxon');

const DEFAULT_TIMEZONE = 'Asia/Ulaanbaatar';

function resolveTimezone(user) {
  const tz = user?.timezone?.trim();
  return tz || DEFAULT_TIMEZONE;
}

function nowInTimezone(timezone = DEFAULT_TIMEZONE) {
  return DateTime.now().setZone(timezone);
}

function startOfDayUtc(timezone = DEFAULT_TIMEZONE, date = new Date()) {
  return DateTime.fromJSDate(date, { zone: timezone }).startOf('day').toUTC().toJSDate();
}

function dateKeyInTimezone(timezone = DEFAULT_TIMEZONE, date = new Date()) {
  return DateTime.fromJSDate(date, { zone: timezone }).toFormat('yyyy-MM-dd');
}

function isExactLocalTime(timezone, hour, minute = 0) {
  const now = nowInTimezone(timezone);
  return now.hour === hour && now.minute === minute;
}

module.exports = {
  DEFAULT_TIMEZONE,
  resolveTimezone,
  nowInTimezone,
  startOfDayUtc,
  dateKeyInTimezone,
  isExactLocalTime,
};
