const { Payment } = require('../models');
const { publicUser } = require('./response');

const MS_DAY = 24 * 60 * 60 * 1000;

function membershipIsPremium(membership) {
  return Boolean(membership && membership !== 'free');
}

function computeMembershipExpiry(planId, startedAt) {
  const start = startedAt instanceof Date ? startedAt : new Date(startedAt);
  if (planId === 'monthly') {
    return new Date(start.getTime() + 30 * MS_DAY);
  }
  if (planId === 'yearly') {
    return new Date(start.getTime() + 365 * MS_DAY);
  }
  return null;
}

function mapPlanToMembership(planId) {
  if (planId === 'lifetime') return 'platinum';
  return planId;
}

function hasActivePremium(user) {
  if (!user || !membershipIsPremium(user.membership)) return false;
  if (user.membershipExpiresAt && user.membershipExpiresAt < new Date()) {
    return false;
  }
  return true;
}

function isAdminGrantedPremium(user) {
  if (!membershipIsPremium(user.membership)) return false;
  if (user.membershipStartedAt || user.membershipExpiresAt) return true;
  if (user.membership === 'platinum' || user.membership === 'lifetime') {
    return true;
  }
  return false;
}

async function resolveUserMembership(user) {
  if (!user) return user;

  const latestPaid = await Payment.findOne({
    where: {
      userId: user.id,
      status: 'paid',
      verifiedByQpay: true,
    },
    order: [['paidAt', 'DESC']],
  });

  if (latestPaid) {
    const startedAt = latestPaid.paidAt || latestPaid.createdAt;
    const expiresAt = computeMembershipExpiry(latestPaid.planId, startedAt);
    const expired = expiresAt && expiresAt < new Date();

    if (expired) {
      user.membership = 'free';
      user.membershipStartedAt = null;
      user.membershipExpiresAt = null;
      await user.save();
      return user;
    }

    user.membership = mapPlanToMembership(latestPaid.planId);
    user.membershipStartedAt = startedAt;
    user.membershipExpiresAt = expiresAt;
    await user.save();
    return user;
  }

  if (isAdminGrantedPremium(user)) {
    if (user.membershipExpiresAt && user.membershipExpiresAt < new Date()) {
      user.membership = 'free';
      user.membershipStartedAt = null;
      user.membershipExpiresAt = null;
      await user.save();
    }
    return user;
  }

  if (
    membershipIsPremium(user.membership) ||
    user.membershipStartedAt ||
    user.membershipExpiresAt
  ) {
    user.membership = 'free';
    user.membershipStartedAt = null;
    user.membershipExpiresAt = null;
    await user.save();
  }

  return user;
}

async function syncUserMembership(user) {
  return resolveUserMembership(user);
}

async function enrichPublicUser(user) {
  await resolveUserMembership(user);
  const json = publicUser(user);
  json.hasActivePremium = hasActivePremium(user);
  return json;
}

function applyAdminMembershipUpdate(user, membership, body = {}) {
  user.membership = membership;

  if (membership === 'free') {
    user.membershipStartedAt = null;
    user.membershipExpiresAt = null;
    return;
  }

  if (body.membershipStartedAt !== undefined) {
    user.membershipStartedAt = body.membershipStartedAt
      ? new Date(body.membershipStartedAt)
      : null;
  } else if (!user.membershipStartedAt) {
    user.membershipStartedAt = new Date();
  }

  if (body.membershipExpiresAt !== undefined) {
    user.membershipExpiresAt = body.membershipExpiresAt
      ? new Date(body.membershipExpiresAt)
      : null;
  } else if (
    body.membershipExpiresAt === undefined &&
    !user.membershipExpiresAt
  ) {
    user.membershipExpiresAt = computeMembershipExpiry(
      membership === 'platinum' ? 'lifetime' : membership,
      user.membershipStartedAt || new Date()
    );
  }
}

module.exports = {
  membershipIsPremium,
  hasActivePremium,
  computeMembershipExpiry,
  mapPlanToMembership,
  resolveUserMembership,
  syncUserMembership,
  enrichPublicUser,
  applyAdminMembershipUpdate,
};
