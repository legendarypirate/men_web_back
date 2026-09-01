const {
  sequelize,
  WorkoutSession,
  Payment,
  AssessmentAnswer,
  Order,
  OrderItem,
  Feedback,
  DeviceToken,
  ScheduledReminder,
  NotificationLog,
} = require('../models');

/**
 * Permanently deletes a user and all associated personal data.
 */
async function deleteUserAccount(user) {
  const userId = user.id;
  const transaction = await sequelize.transaction();

  try {
    const orders = await Order.findAll({ where: { userId }, transaction });
    const orderIds = orders.map((order) => order.id);
    if (orderIds.length > 0) {
      await OrderItem.destroy({ where: { orderId: orderIds }, transaction });
    }

    await Order.destroy({ where: { userId }, transaction });
    await WorkoutSession.destroy({ where: { userId }, transaction });
    await Payment.destroy({ where: { userId }, transaction });
    await AssessmentAnswer.destroy({ where: { userId }, transaction });
    await Feedback.destroy({ where: { userId }, transaction });
    await DeviceToken.destroy({ where: { userId }, transaction });
    await ScheduledReminder.destroy({ where: { userId }, transaction });
    await NotificationLog.destroy({ where: { userId }, transaction });
    await user.destroy({ transaction });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = { deleteUserAccount };
