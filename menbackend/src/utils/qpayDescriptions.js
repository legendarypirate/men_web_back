/** QPay invoice_description (Гүйлгээний утга) prefixes — keep SUB vs SHOP distinct. */
const SUB_PREFIX = 'TENKHEE SUB';
const SHOP_PREFIX = 'TENKHEE SHOP';

function trimText(value, maxLen) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.length <= maxLen ? text : `${text.slice(0, maxLen - 1)}…`;
}

function subscriptionDescription(planTitle) {
  return `${SUB_PREFIX}: ${trimText(planTitle, 120)}`;
}

function subscriptionSenderInvoiceNo(planId) {
  return `SUB-${String(planId).toUpperCase()}-${Date.now()}`;
}

function shopOrderSummary(items = []) {
  if (!items.length) return 'Захиалга';
  const first = items[0];
  const name = first.productName || first.name || 'Бараа';
  const qty = first.quantity || 1;
  const suffix = items.length > 1 ? ` +${items.length - 1}` : '';
  return trimText(`${name} x${qty}${suffix}`, 80);
}

function shopDescription(orderNumber, summary) {
  return `${SHOP_PREFIX}: ${orderNumber} — ${trimText(summary, 80) || 'Захиалга'}`;
}

function shopSenderInvoiceNo(orderNumber) {
  return String(orderNumber);
}

function parsePaymentKind(description) {
  const text = String(description || '');
  if (text.startsWith(SUB_PREFIX)) return 'subscription';
  if (text.startsWith(SHOP_PREFIX)) return 'shop';
  return 'unknown';
}

module.exports = {
  SUB_PREFIX,
  SHOP_PREFIX,
  subscriptionDescription,
  subscriptionSenderInvoiceNo,
  shopOrderSummary,
  shopDescription,
  shopSenderInvoiceNo,
  parsePaymentKind,
};
