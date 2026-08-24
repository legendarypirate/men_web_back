const https = require('https');
const { URL } = require('url');

const QPAY_LOGIN = process.env.QPAY_LOGIN || '';
const QPAY_PASSWORD = process.env.QPAY_PASSWORD || '';
const QPAY_BASE_URL = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE || '';
const QPAY_RECEIVER_CODE = process.env.QPAY_RECEIVER_CODE || '';
const QPAY_REQUEST_TIMEOUT = parseInt(process.env.QPAY_REQUEST_TIMEOUT || '15000', 10);
const QPAY_RETRY_ATTEMPTS = parseInt(process.env.QPAY_RETRY_ATTEMPTS || '2', 10);
const QPAY_RETRY_DELAY_MS = parseInt(process.env.QPAY_RETRY_DELAY_MS || '500', 10);
const QPAY_USE_DOH_FALLBACK = process.env.QPAY_USE_DOH_FALLBACK !== '0';
const QPAY_TOKEN_CACHE_TTL_MS = parseInt(process.env.QPAY_TOKEN_CACHE_TTL_MS || '3300000', 10);

let qpayResolvedConnection = null;
let qpayTokenCache = { token: null, expiresAt: 0 };

function isConfigured() {
  return Boolean(
    QPAY_LOGIN &&
      QPAY_PASSWORD &&
      QPAY_INVOICE_CODE &&
      QPAY_RECEIVER_CODE
  );
}

function getQPayHostAndPath() {
  const u = new URL(QPAY_BASE_URL);
  return {
    hostname: u.hostname,
    path: u.pathname.replace(/\/$/, '') || '',
    protocol: u.protocol,
  };
}

function getConnectionConfig() {
  if (qpayResolvedConnection) {
    return {
      baseUrl: qpayResolvedConnection.baseUrl,
      agent: qpayResolvedConnection.agent,
      hostHeader: qpayResolvedConnection.hostname,
    };
  }
  return { baseUrl: QPAY_BASE_URL, agent: undefined, hostHeader: undefined };
}

async function resolveHostViaDoH(hostname) {
  const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
  const res = await fetch(dohUrl, {
    headers: { Accept: 'application/dns-json' },
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  const answers = data?.Answer || [];
  const a = answers.find((r) => r.type === 1 && r.data);
  if (a?.data) return a.data;
  throw new Error(`DoH: no A record for ${hostname}`);
}

function httpsJsonRequest(url, { method = 'GET', headers = {}, body, agent, servername }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers,
        agent,
        servername: servername || parsed.hostname,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = {};
          try {
            json = text ? JSON.parse(text) : {};
          } catch (_) {
            json = { message: text };
          }
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json,
          });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(QPAY_REQUEST_TIMEOUT, () => {
      req.destroy(new Error('QPay request timeout'));
    });
    if (body !== undefined) req.write(body);
    req.end();
  });
}

async function qpayRequest(path, { method = 'GET', body, token, basicAuth } = {}) {
  const cfg = getConnectionConfig();
  const url = `${cfg.baseUrl}${path}`;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (basicAuth) headers.Authorization = `Basic ${basicAuth}`;
  if (cfg.hostHeader) headers.Host = cfg.hostHeader;

  const res = await httpsJsonRequest(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    agent: cfg.agent,
    servername: cfg.hostHeader,
  });

  if (!res.ok) {
    throw new Error(res.json?.message || res.json?.error || `QPay HTTP ${res.status}`);
  }
  return res.json;
}

async function withRetry(fn, label = 'QPay request') {
  let lastError;
  for (let attempt = 1; attempt <= QPAY_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      const retryable =
        msg.includes('EAI_AGAIN') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('ENOTFOUND') ||
        msg.includes('timeout');
      if (attempt < QPAY_RETRY_ATTEMPTS && retryable) {
        await new Promise((r) => setTimeout(r, QPAY_RETRY_DELAY_MS));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

async function getQPayTokenViaDoH() {
  const { hostname, path, protocol } = getQPayHostAndPath();
  const ip = await resolveHostViaDoH(hostname);
  const baseUrl = `${protocol}//${ip}${path}`;
  const agent = new https.Agent({ servername: hostname });
  qpayResolvedConnection = { baseUrl, agent, hostname };

  const basicAuth = Buffer.from(`${QPAY_LOGIN}:${QPAY_PASSWORD}`).toString('base64');
  const data = await qpayRequest('/auth/token', {
    method: 'POST',
    body: {},
    basicAuth,
  });
  if (!data?.access_token) throw new Error('Failed to get QPay token via DoH');
  return data;
}

async function getQPayToken() {
  const now = Date.now();
  if (qpayTokenCache.token && qpayTokenCache.expiresAt > now) {
    return qpayTokenCache.token;
  }

  const isDnsError = (msg) =>
    typeof msg === 'string' && (msg.includes('EAI_AGAIN') || msg.includes('ENOTFOUND'));

  const setTokenCache = (token, expiresInSeconds) => {
    const ttlMs =
      expiresInSeconds && expiresInSeconds > 0
        ? Math.min((expiresInSeconds - 300) * 1000, QPAY_TOKEN_CACHE_TTL_MS)
        : QPAY_TOKEN_CACHE_TTL_MS;
    qpayTokenCache = { token, expiresAt: now + ttlMs };
  };

  const basicAuth = Buffer.from(`${QPAY_LOGIN}:${QPAY_PASSWORD}`).toString('base64');

  try {
    const data = await withRetry(
      () =>
        qpayRequest('/auth/token', {
          method: 'POST',
          body: {},
          basicAuth,
        }),
      'QPay auth'
    );
    setTokenCache(data.access_token, data.expires_in);
    return data.access_token;
  } catch (err) {
    if (QPAY_USE_DOH_FALLBACK && isDnsError(err.message)) {
      const data = await getQPayTokenViaDoH();
      setTokenCache(data.access_token, data.expires_in || 3600);
      return data.access_token;
    }
    throw err;
  }
}

function formatQrImage(qrImage) {
  if (!qrImage) return null;
  if (
    qrImage.startsWith('data:') ||
    qrImage.startsWith('http://') ||
    qrImage.startsWith('https://') ||
    qrImage.startsWith('/')
  ) {
    return qrImage;
  }
  if (qrImage.startsWith('iVBORw0KGgo') || /^[A-Za-z0-9+/=]+$/.test(qrImage)) {
    const raw = qrImage.replace(/^data:image\/png;base64,/, '');
    return `data:image/png;base64,${raw}`;
  }
  return qrImage;
}

async function createInvoice({ amount, description, senderInvoiceNo }) {
  const token = await getQPayToken();
  const data = await withRetry(
    () =>
      qpayRequest('/invoice', {
        method: 'POST',
        token,
        body: {
          invoice_code: QPAY_INVOICE_CODE,
          sender_invoice_no: senderInvoiceNo,
          invoice_receiver_code: QPAY_RECEIVER_CODE,
          invoice_description: description,
          amount: Number(amount),
        },
      }),
    'QPay create invoice'
  );

  if (!data?.invoice_id) {
    throw new Error('QPay invoice response missing invoice_id');
  }

  return {
    invoiceId: data.invoice_id,
    qrImage: formatQrImage(data.qr_image),
    qrText: data.qr_text || data.qr_code || null,
    bankUrls: Array.isArray(data.urls) ? data.urls : [],
  };
}

async function checkInvoicePayment(invoiceId) {
  const token = await getQPayToken();
  const data = await withRetry(
    () =>
      qpayRequest('/payment/check', {
        method: 'POST',
        token,
        body: {
          object_type: 'INVOICE',
          object_id: invoiceId,
          offset: { page_number: 1, page_limit: 100 },
        },
      }),
    'QPay payment check'
  );

  const rows = data?.rows || [];
  if (!rows.length) {
    return { isPaid: false, status: 'PENDING' };
  }

  const payment = rows[0];
  const status = payment.payment_status || 'PENDING';
  return { isPaid: status === 'PAID', status, payment };
}

module.exports = {
  isConfigured,
  formatQrImage,
  createInvoice,
  checkInvoicePayment,
};
