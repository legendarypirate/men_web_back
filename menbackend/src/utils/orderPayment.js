async function markOrderPaid(order) {
  if (order.status === 'paid') return order;
  if (order.status === 'cancelled') {
    throw new Error('Захиалга цуцлагдсан');
  }
  order.status = 'paid';
  order.paidAt = new Date();
  order.verifiedByQpay = true;
  await order.save();
  return order;
}

module.exports = { markOrderPaid };
