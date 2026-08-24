const express = require('express');
const { Op } = require('sequelize');
const { Product, Order, OrderItem } = require('../models');
const { ok, fail, formatMnt } = require('../utils/response');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/products', async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const where = { active: true, inStock: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const products = await Product.findAll({
      where,
      order: [
        ['featured', 'DESC'],
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });
    return ok(res, { products });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product || !product.active) {
      return fail(res, 'Бүтээгдэхүүн олдсонгүй', 404);
    }
    return ok(res, { product });
  } catch (err) {
    next(err);
  }
});

router.post('/orders', optionalAuth, async (req, res, next) => {
  try {
    const {
      items = [],
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      paymentMethod = 'qpay',
      notes,
    } = req.body;

    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return fail(res, 'Худалдан авагч болон бүтээгдэхүүн шаардлагатай');
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds }, active: true, inStock: true },
    });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    let totalMnt = 0;
    const lineItems = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) return fail(res, `Бүтээгдэхүүн олдсонгүй: ${item.productId}`);
      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = product.priceMnt * qty;
      totalMnt += lineTotal;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPriceMnt: product.priceMnt,
        lineTotalMnt: lineTotal,
      });
    }

    const orderNumber = `VM-${Date.now().toString(36).toUpperCase()}`;
    const order = await Order.create({
      orderNumber,
      userId: req.user?.id || null,
      status: 'pending',
      totalMnt,
      customerName,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      shippingAddress: shippingAddress || null,
      paymentMethod,
      notes: notes || null,
    });

    for (const line of lineItems) {
      await OrderItem.create({ ...line, orderId: order.id });
    }

    const full = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    return ok(
      res,
      {
        order: full,
        totalLabel: formatMnt(totalMnt),
        qrPayload: `Tenkhee|${orderNumber}|${totalMnt}`,
      },
      'Захиалга үүслээ',
      201
    );
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:orderNumber', optionalAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { orderNumber: req.params.orderNumber },
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) return fail(res, 'Захиалга олдсонгүй', 404);
    if (req.user && order.userId && order.userId !== req.user.id) {
      return fail(res, 'Эрхгүй', 403);
    }
    return ok(res, { order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
