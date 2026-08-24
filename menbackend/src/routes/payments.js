const express = require('express');
const { PremiumPlan, Payment } = require('../models');
const { ok, fail, formatMnt, publicUser } = require('../utils/response');
const { authRequired, optionalAuth } = require('../middleware/auth');
const { getPaymentSettings, mapPaymentSettings } = require('../utils/paymentSettings');
const {
  validatePromoCode,
  incrementPromoUsage,
  normalizeCode,
} = require('../utils/promoCode');
const qpayService = require('../services/qpayService');

const router = express.Router();

function mapPlan(plan) {
  const json = plan.toJSON();
  return {
    ...json,
    priceLabel: `${formatMnt(json.amountMnt)} ${json.periodLabel}`,
    amountLabel: formatMnt(json.amountMnt),
  };
}

function mapBankUrls(urls) {
  if (!Array.isArray(urls)) return [];
  return urls
    .map((entry) => ({
      name: entry.name || entry.description || 'Bank',
      logo: entry.logo || entry.logo_url || '',
      link: entry.link || entry.deeplink || '',
      description: entry.description || entry.name || '',
    }))
    .filter((entry) => entry.link);
}

function mapPayment(payment, plan, extra = {}) {
  const bankUrls = mapBankUrls(payment.bankUrls);
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amountMnt: payment.amountMnt,
    amountLabel: formatMnt(payment.amountMnt),
    originalAmountMnt: payment.originalAmountMnt,
    originalAmountLabel: payment.originalAmountMnt
      ? formatMnt(payment.originalAmountMnt)
      : null,
    discountMnt: payment.discountMnt,
    discountAmountLabel:
      payment.discountMnt > 0 ? formatMnt(payment.discountMnt) : null,
    promoCode: payment.promoCode,
    currency: payment.currency,
    status: payment.status,
    qrPayload: payment.qrPayload,
    qrImage: payment.qrImage || null,
    qrText: payment.qrText || null,
    banks: bankUrls,
    expiresAt: payment.expiresAt,
    paidAt: payment.paidAt,
    plan: plan ? mapPlan(plan) : null,
    merchant: 'VitalMen LLC',
    ...extra,
  };
}

async function unlockMembership(user, payment) {
  user.membership = payment.planId === 'lifetime' ? 'lifetime' : payment.planId;
  if (payment.planId === 'monthly') {
    user.membershipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (payment.planId === 'yearly') {
    user.membershipExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  } else {
    user.membershipExpiresAt = null;
  }
  if (payment.planId === 'lifetime' || payment.planId === 'yearly') {
    user.membership = payment.planId === 'lifetime' ? 'platinum' : 'yearly';
  }
  await user.save();
}

async function markPaymentPaid(payment, user) {
  if (payment.status === 'paid') {
    return { payment, user: publicUser(user) };
  }
  if (payment.status === 'expired') {
    throw new Error('Нэхэмжлэхийн хугацаа дууссан');
  }

  payment.status = 'paid';
  payment.paidAt = new Date();
  await payment.save();

  if (payment.promoCode) {
    await incrementPromoUsage(payment.promoCode);
  }

  await unlockMembership(user, payment);
  return { payment, user: publicUser(user) };
}

async function syncPaymentWithQPay(payment, user) {
  if (!qpayService.isConfigured() || payment.status !== 'pending') {
    return payment;
  }

  try {
    const result = await qpayService.checkInvoicePayment(payment.invoiceId);
    if (result.isPaid) {
      await markPaymentPaid(payment, user);
    }
  } catch (err) {
    console.warn('QPay status check failed:', err.message);
  }

  return payment;
}

router.get('/settings', optionalAuth, async (req, res, next) => {
  try {
    const settings = await getPaymentSettings();
    return ok(res, { settings: mapPaymentSettings(settings) });
  } catch (err) {
    next(err);
  }
});

router.get('/plans', optionalAuth, async (req, res, next) => {
  try {
    const plans = await PremiumPlan.findAll({ order: [['sortOrder', 'ASC']] });
    return ok(res, { plans: plans.map(mapPlan) });
  } catch (err) {
    next(err);
  }
});

router.post('/promo/validate', authRequired, async (req, res, next) => {
  try {
    const { code, planId } = req.body;
    if (!code || !planId) {
      return fail(res, 'Promo код болон багц шаардлагатай');
    }

    const plan = await PremiumPlan.findByPk(planId);
    if (!plan) return fail(res, 'Багц олдсонгүй', 404);

    const result = await validatePromoCode(code, plan.id, plan.amountMnt);
    if (!result.valid) {
      return fail(res, result.message || 'Promo код хүчингүй');
    }

    return ok(res, {
      promo: {
        ...result,
        originalAmountLabel: formatMnt(result.originalAmountMnt),
        discountAmountLabel: formatMnt(result.discountMnt),
        finalAmountLabel: formatMnt(result.finalAmountMnt),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/qpay/invoice', authRequired, async (req, res, next) => {
  try {
    const settings = await getPaymentSettings();
    if (!settings.qpayEnabled) {
      return fail(res, 'QPay одоогоор идэвхгүй байна', 503);
    }

    const { planId, promoCode } = req.body;
    const plan = await PremiumPlan.findByPk(planId);
    if (!plan) return fail(res, 'Багц олдсонгүй', 404);

    let amountMnt = plan.amountMnt;
    let originalAmountMnt = plan.amountMnt;
    let discountMnt = 0;
    let appliedPromoCode = null;

    if (promoCode) {
      const promo = await validatePromoCode(promoCode, plan.id, plan.amountMnt);
      if (!promo.valid) {
        return fail(res, promo.message || 'Promo код хүчингүй');
      }
      amountMnt = promo.finalAmountMnt;
      originalAmountMnt = promo.originalAmountMnt;
      discountMnt = promo.discountMnt;
      appliedPromoCode = normalizeCode(promo.code);
    }

    const stamp = Date.now();
    const senderInvoiceNo = `VM-${plan.id.toUpperCase()}-${stamp}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const description = `VitalMen Premium — ${plan.title}`;

    let invoiceId = senderInvoiceNo;
    let qrPayload = `QPAY|MERCHANT=VITALMEN|INVOICE=${senderInvoiceNo}|amount=${amountMnt}|currency=MNT|desc=${plan.title}`;
    let qrImage = null;
    let qrText = null;
    let bankUrls = [];

    if (qpayService.isConfigured()) {
      const qpayInvoice = await qpayService.createInvoice({
        amount: amountMnt,
        description,
        senderInvoiceNo,
      });
      invoiceId = qpayInvoice.invoiceId;
      qrImage = qpayInvoice.qrImage;
      qrText = qpayInvoice.qrText;
      qrPayload = qrText || qrPayload;
      bankUrls = qpayInvoice.bankUrls;
    }

    const payment = await Payment.create({
      userId: req.user.id,
      planId: plan.id,
      invoiceId,
      amountMnt,
      originalAmountMnt,
      discountMnt,
      promoCode: appliedPromoCode,
      currency: 'MNT',
      status: 'pending',
      qrPayload,
      qrImage,
      qrText,
      bankUrls,
      expiresAt,
    });

    return ok(
      res,
      {
        payment: mapPayment(payment, plan),
      },
      'QPay нэхэмжлэх үүслээ',
      201
    );
  } catch (err) {
    next(err);
  }
});

router.get('/qpay/:invoiceId', authRequired, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      where: { invoiceId: req.params.invoiceId, userId: req.user.id },
      include: [{ model: PremiumPlan, as: 'plan' }],
    });
    if (!payment) return fail(res, 'Нэхэмжлэх олдсонгүй', 404);

    if (
      payment.status === 'pending' &&
      payment.expiresAt &&
      payment.expiresAt < new Date()
    ) {
      payment.status = 'expired';
      await payment.save();
    } else if (payment.status === 'pending') {
      await syncPaymentWithQPay(payment, req.user);
      await payment.reload({ include: [{ model: PremiumPlan, as: 'plan' }] });
    }

    return ok(res, {
      payment: mapPayment(payment, payment.plan),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/qpay/:invoiceId/confirm', authRequired, async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      where: { invoiceId: req.params.invoiceId, userId: req.user.id },
    });
    if (!payment) return fail(res, 'Нэхэмжлэх олдсонгүй', 404);
    if (payment.status === 'paid') {
      return ok(res, { payment, user: publicUser(req.user) }, 'Аль хэдийн төлөгдсөн');
    }
    if (payment.status === 'expired') {
      return fail(res, 'Нэхэмжлэхийн хугацаа дууссан');
    }

    if (qpayService.isConfigured()) {
      const result = await qpayService.checkInvoicePayment(payment.invoiceId);
      if (!result.isPaid) {
        return fail(res, 'Төлбөр хараахан баталгаажаагүй байна');
      }
    }

    const payload = await markPaymentPaid(payment, req.user);
    return ok(res, payload, 'Төлбөр амжилттай');
  } catch (err) {
    next(err);
  }
});

router.post('/qpay/webhook', async (req, res, next) => {
  try {
    const invoiceId = req.body?.object_id;
    const paymentStatus = req.body?.payment_status;
    if (!invoiceId) {
      return fail(res, 'Invalid webhook payload', 400);
    }

    const payment = await Payment.findOne({ where: { invoiceId } });
    if (!payment) {
      return ok(res, { received: true }, 'Payment not found');
    }

    if (paymentStatus === 'PAID' && payment.status !== 'paid') {
      const { User } = require('../models');
      const user = await User.findByPk(payment.userId);
      if (user) {
        await markPaymentPaid(payment, user);
      }
    }

    return ok(res, { received: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
