const { PromoCode } = require('../models');

function normalizeCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function computeDiscount(amountMnt, discountPercent) {
  const safeAmount = Math.max(0, Number(amountMnt) || 0);
  const safePercent = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const discountMnt = Math.round((safeAmount * safePercent) / 100);
  const finalAmountMnt = Math.max(0, safeAmount - discountMnt);
  return { discountMnt, finalAmountMnt };
}

async function findPromo(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  return PromoCode.findByPk(normalized);
}

async function validatePromoCode(code, planId, planAmountMnt) {
  const normalized = normalizeCode(code);
  if (!normalized) {
    return { valid: false, message: 'Пromo код оруулна уу' };
  }

  const promo = await findPromo(normalized);
  if (!promo || !promo.active) {
    return { valid: false, message: 'Promo код буруу эсвэл идэвхгүй байна' };
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { valid: false, message: 'Promo кодын хугацаа дууссан' };
  }

  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return { valid: false, message: 'Promo код ашиглах боломжгүй болсон' };
  }

  const allowedPlans = Array.isArray(promo.planIds) ? promo.planIds : [];
  if (allowedPlans.length > 0 && planId && !allowedPlans.includes(planId)) {
    return { valid: false, message: 'Энэ promo код сонгосон багцад хамаарахгүй' };
  }

  const originalAmountMnt = Math.max(0, Number(planAmountMnt) || 0);
  const { discountMnt, finalAmountMnt } = computeDiscount(
    originalAmountMnt,
    promo.discountPercent
  );

  if (discountMnt <= 0) {
    return { valid: false, message: 'Promo код хөнгөлөлт өгөхгүй байна' };
  }

  return {
    valid: true,
    code: promo.code,
    label: promo.label,
    discountPercent: promo.discountPercent,
    originalAmountMnt,
    discountMnt,
    finalAmountMnt,
    coachProgramId: promo.coachProgramId,
    message: `${promo.discountPercent}% хөнгөлөлт хэрэглэгдлээ`,
  };
}

async function incrementPromoUsage(code) {
  const promo = await findPromo(code);
  if (!promo) return;
  await promo.update({ usedCount: (promo.usedCount || 0) + 1 });
}

module.exports = {
  normalizeCode,
  computeDiscount,
  validatePromoCode,
  incrementPromoUsage,
};
