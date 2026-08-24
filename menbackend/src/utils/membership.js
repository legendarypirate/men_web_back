const { Payment } = require('../models');

function membershipIsPremium(membership) {
  return Boolean(membership && membership !== 'free');
}

async function syncUserMembership(user) {
  if (!user) return user;

  const paidCount = await Payment.count({
    where: { userId: user.id, status: 'paid' },
  });

  if (paidCount === 0) {
    if (membershipIsPremium(user.membership) || user.membershipExpiresAt) {
      user.membership = 'free';
      user.membershipExpiresAt = null;
      await user.save();
    }
    return user;
  }

  if (
    user.membershipExpiresAt &&
    user.membershipExpiresAt < new Date() &&
    membershipIsPremium(user.membership)
  ) {
    user.membership = 'free';
    user.membershipExpiresAt = null;
    await user.save();
  }

  return user;
}

module.exports = { membershipIsPremium, syncUserMembership };
