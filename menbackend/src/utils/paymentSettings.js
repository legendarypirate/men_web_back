const { PaymentSettings } = require('../models');

const DEFAULT_ID = 'default';

const DEFAULTS = {
  id: DEFAULT_ID,
  qpayEnabled: true,
  bankName: 'Хаан банк',
  bankAccountNumber: '5000123456',
  bankAccountName: 'Tenkhee LLC',
  transferNote:
    'Гүйлгээний утга дээр имэйл хаягаа бичнэ үү. Төлбөр баталгаажмагц таны эрх идэвхжинэ.',
};

async function getPaymentSettings() {
  let settings = await PaymentSettings.findByPk(DEFAULT_ID);
  if (!settings) {
    settings = await PaymentSettings.create(DEFAULTS);
  }
  return settings;
}

function mapPaymentSettings(settings) {
  const json = settings.toJSON();
  return {
    qpayEnabled: json.qpayEnabled,
    bankName: json.bankName,
    bankAccountNumber: json.bankAccountNumber,
    bankAccountName: json.bankAccountName,
    transferNote: json.transferNote || DEFAULTS.transferNote,
  };
}

module.exports = { getPaymentSettings, mapPaymentSettings, DEFAULTS };
