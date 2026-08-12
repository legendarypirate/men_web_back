const express = require('express');
const { PremiumPlan, Payment } = require('../models');
const { ok, fail, formatMnt, publicUser } = require('../utils/response');
const { authRequired, optionalAuth } = require('../middleware/auth');
const { getPaymentSettings, mapPaymentSettings } = require('../utils/paymentSettings');

const router = express.Router();

function mapPlan(plan) {
  const json = plan.toJSON();
  return {
    ...json,
    priceLabel: `${formatMnt(json.amountMnt)} ${json.periodLabel}`,
    amountLabel: formatMnt(json.amountMnt),
  };
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

router.post('/qpay/invoice', authRequired, async (req, res, next) => {
  try {
    const settings = await getPaymentSettings();
    if (!settings.qpayEnabled) {
      return fail(res, 'QPay одоогоор идэвхгүй байна', 503);
    }

    const { planId } = req.body;
    const plan = await PremiumPlan.findByPk(planId);
    if (!plan) return fail(res, 'Багц олдсонгүй', 404);

    const stamp = Date.now();
    const invoiceId = `VM-${plan.id.toUpperCase()}-${stamp}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const qrPayload = `QPAY|MERCHANT=VITALMEN|INVOICE=${invoiceId}|amount=${plan.amountMnt}|currency=MNT|desc=${plan.title}`;

    const payment = await Payment.create({
      userId: req.user.id,
      planId: plan.id,
      invoiceId,
      amountMnt: plan.amountMnt,
      currency: 'MNT',
      status: 'pending',
      qrPayload,
      expiresAt,
    });

    return ok(
      res,
      {
        payment: {
          id: payment.id,
          invoiceId: payment.invoiceId,
          amountMnt: payment.amountMnt,
          amountLabel: formatMnt(payment.amountMnt),
          currency: payment.currency,
          status: payment.status,
          qrPayload: payment.qrPayload,
          expiresAt: payment.expiresAt,
          plan: mapPlan(plan),
          merchant: 'VitalMen LLC',
          banks: [
            'Хаан банк',
            'Голомт',
            'ХХБ',
            'Төрийн банк',
            'Капитрон',
            'М банк',
          ],
        },
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
    }

    return ok(res, {
      payment: {
        id: payment.id,
        invoiceId: payment.invoiceId,
        amountMnt: payment.amountMnt,
        amountLabel: formatMnt(payment.amountMnt),
        status: payment.status,
        qrPayload: payment.qrPayload,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt,
        plan: payment.plan ? mapPlan(payment.plan) : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Demo: mark invoice paid (simulates QPay callback / "Төлбөр шалгах")
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

    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    const user = req.user;
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

    return ok(
      res,
      { payment, user: publicUser(user) },
      'Төлбөр амжилттай'
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
