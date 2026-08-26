const express = require('express');
const { Op } = require('sequelize');
const { Product, Order, OrderItem } = require('../models');
const { ok, fail, formatMnt } = require('../utils/response');
const { optionalAuth } = require('../middleware/auth');
const { getPaymentSettings } = require('../utils/paymentSettings');
const qpayService = require('../services/qpayService');
const {
  shopDescription,
  shopOrderSummary,
  shopSenderInvoiceNo,
} = require('../utils/qpayDescriptions');
const { markOrderPaid } = require('../utils/orderPayment');

const router = express.Router();

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

function mapOrderPayment(order, extra = {}) {
  const bankUrls = mapBankUrls(order.bankUrls);
  return {
    orderNumber: order.orderNumber,
    invoiceId: order.invoiceId,
    amountMnt: order.totalMnt,
    amountLabel: formatMnt(order.totalMnt),
    status: order.status,
    paymentDescription: order.paymentDescription,
    qrPayload: order.qrPayload,
    qrImage: order.qrImage || null,
    qrText: order.qrText || null,
    banks: bankUrls,
    expiresAt: order.expiresAt,
    paidAt: order.paidAt,
    verifiedByQpay: order.verifiedByQpay,
    merchant: 'Tenkhee LLC',
    ...extra,
  };
}

function requireQPayConfigured(res) {
  if (qpayService.isConfigured()) return true;
  fail(
    res,
    'QPay merchant тохиргоо дутуу байна. QPAY_* env хувьсагчуудыг backend дээр тохируулна уу.',
    503
  );
  return false;
}

async function syncOrderWithQPay(order) {
  if (!qpayService.isConfigured() || order.status !== 'pending' || !order.invoiceId) {
    return order;
  }

  if (order.expiresAt && order.expiresAt < new Date()) {
    return order;
  }

  try {
    const result = await qpayService.checkInvoicePayment(order.invoiceId);
    if (result.isPaid) {
      await markOrderPaid(order);
    }
  } catch (err) {
    console.warn('[QPay] Shop order status check failed:', err.message);
  }

  return order;
}

async function createOrderQPayInvoice(order, items = []) {
  if (order.invoiceId && order.status === 'pending') {
    return order;
  }
  if (order.status !== 'pending') {
    throw new Error('Захиалга аль хэдийн төлөгдсөн эсвэл цуцлагдсан');
  }

  const summary = shopOrderSummary(items);
  const paymentDescription = shopDescription(order.orderNumber, summary);
  const senderInvoiceNo = shopSenderInvoiceNo(order.orderNumber);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  console.log('[QPay] Creating shop invoice', {
    orderNumber: order.orderNumber,
    amountMnt: order.totalMnt,
    senderInvoiceNo,
    paymentDescription,
  });

  const qpayInvoice = await qpayService.createInvoice({
    amount: order.totalMnt,
    description: paymentDescription,
    senderInvoiceNo,
  });

  const invoiceId = qpayInvoice.invoiceId;
  const qrImage = qpayInvoice.qrImage;
  const qrText = qpayInvoice.qrText;
  const qrPayload =
    qrText || `QPAY|TENKHEE|INVOICE=${invoiceId}|amount=${order.totalMnt}`;
  const bankUrls = qpayInvoice.bankUrls;

  await order.update({
    invoiceId,
    paymentDescription,
    qrPayload,
    qrImage,
    qrText,
    bankUrls,
    expiresAt,
  });

  console.log('[QPay] Shop invoice created', {
    orderNumber: order.orderNumber,
    invoiceId,
    banks: bankUrls.length,
  });

  return order;
}

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

async function findOrderForPayment(orderNumber, user) {
  const order = await Order.findOne({
    where: { orderNumber },
    include: [{ model: OrderItem, as: 'items' }],
  });
  if (!order) {
    return { order: null, errorMessage: 'Захиалга олдсонгүй', errorStatus: 404 };
  }
  if (user && order.userId && order.userId !== user.id) {
    return { order: null, errorMessage: 'Эрхгүй', errorStatus: 403 };
  }
  return { order, errorMessage: null, errorStatus: null };
}

async function handleCreateQPayInvoice(req, res, next) {
  try {
    const orderNumber = req.body?.orderNumber || req.params.orderNumber;
    if (!orderNumber) {
      return fail(res, 'orderNumber шаардлагатай');
    }

    const settings = await getPaymentSettings();
    if (!settings.qpayEnabled) {
      return fail(res, 'QPay одоогоор идэвхгүй байна', 503);
    }
    if (!requireQPayConfigured(res)) return;

    const { order, errorMessage, errorStatus } = await findOrderForPayment(
      orderNumber,
      req.user
    );
    if (!order) return fail(res, errorMessage, errorStatus);

    if (order.status === 'paid') {
      return ok(res, { payment: mapOrderPayment(order) }, 'Аль хэдийн төлөгдсөн');
    }
    if (order.status !== 'pending') {
      return fail(res, 'Захиалга төлбөр хүлээн авах боломжгүй');
    }

    await createOrderQPayInvoice(order, order.items || []);
    await order.reload({ include: [{ model: OrderItem, as: 'items' }] });
    return ok(res, { payment: mapOrderPayment(order) }, 'QPay нэхэмжлэх үүслээ', 201);
  } catch (err) {
    next(err);
  }
}

async function handleGetQPayStatus(req, res, next) {
  try {
    const orderNumber = req.query.orderNumber || req.params.orderNumber;
    if (!orderNumber) {
      return fail(res, 'orderNumber шаардлагатай');
    }

    const { order, errorMessage, errorStatus } = await findOrderForPayment(
      orderNumber,
      req.user
    );
    if (!order) return fail(res, errorMessage, errorStatus);

    if (!order.invoiceId) {
      return fail(res, 'QPay нэхэмжлэх үүсээгүй байна', 404);
    }

    if (order.status === 'pending') {
      await syncOrderWithQPay(order);
      await order.reload({ include: [{ model: OrderItem, as: 'items' }] });
    }

    return ok(res, { payment: mapOrderPayment(order) });
  } catch (err) {
    next(err);
  }
}

async function handleConfirmQPay(req, res, next) {
  try {
    const orderNumber = req.body?.orderNumber || req.params.orderNumber;
    if (!orderNumber) {
      return fail(res, 'orderNumber шаардлагатай');
    }

    const { order, errorMessage, errorStatus } = await findOrderForPayment(
      orderNumber,
      req.user
    );
    if (!order) return fail(res, errorMessage, errorStatus);

    if (order.status === 'paid') {
      return ok(res, { order, payment: mapOrderPayment(order) }, 'Аль хэдийн төлөгдсөн');
    }
    if (!order.invoiceId) {
      return fail(res, 'QPay нэхэмжлэх олдсонгүй', 404);
    }
    if (!requireQPayConfigured(res)) return;

    const result = await qpayService.checkInvoicePayment(order.invoiceId);
    if (!result.isPaid) {
      return fail(res, 'Төлбөр хараахан баталгаажаагүй байна');
    }

    await markOrderPaid(order);
    const full = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    return ok(res, { order: full, payment: mapOrderPayment(full) }, 'Төлбөр амжилттай');
  } catch (err) {
    next(err);
  }
}

// Flat QPay routes (preferred — avoids nested path issues on some deployments)
router.post('/qpay/invoice', optionalAuth, handleCreateQPayInvoice);
router.get('/qpay/status', optionalAuth, handleGetQPayStatus);
router.post('/qpay/confirm', optionalAuth, handleConfirmQPay);

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
      createQpayInvoice = true,
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

    const orderNumber = `SHOP-${Date.now().toString(36).toUpperCase()}`;
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
      paymentDescription: shopDescription(
        orderNumber,
        shopOrderSummary(lineItems)
      ),
    });

    for (const line of lineItems) {
      await OrderItem.create({ ...line, orderId: order.id });
    }

    let payment = null;
    const settings = await getPaymentSettings();
    if (
      paymentMethod === 'qpay' &&
      settings.qpayEnabled &&
      createQpayInvoice &&
      qpayService.isConfigured()
    ) {
      await createOrderQPayInvoice(order, lineItems);
      await order.reload();
      payment = mapOrderPayment(order);
    }

    const full = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    return ok(
      res,
      {
        order: full,
        totalLabel: formatMnt(totalMnt),
        payment,
        paymentDescription: full.paymentDescription,
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
    return ok(res, {
      order,
      payment: order.invoiceId ? mapOrderPayment(order) : null,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:orderNumber/qpay/invoice', optionalAuth, handleCreateQPayInvoice);

router.get('/orders/:orderNumber/qpay', optionalAuth, handleGetQPayStatus);

router.post('/orders/:orderNumber/qpay/confirm', optionalAuth, handleConfirmQPay);

module.exports = router;
