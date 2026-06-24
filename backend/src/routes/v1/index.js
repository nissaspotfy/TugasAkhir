const express = require('express');

const router = express.Router();
const authRouter = require('./auth');
const userRouter = require('./user');
const productRouter = require('./product');
const transactionRouter = require('./transaction');
const promoRouter = require('./promo');
const addressRouter = require('./address');
const cartRouter = require('./cart');
const shippingRouter = require('./shipping');
const categoryRouter = require('./category');
const settingRouter = require('./setting');
const reviewRouter = require('./review');
const notificationRouter = require('./notification');

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/transactions', transactionRouter);
router.use('/promos', promoRouter);
router.use('/addresses', addressRouter);
router.use('/cart', cartRouter);
router.use('/shipping', shippingRouter);
router.use('/categories', categoryRouter);
router.use('/settings', settingRouter);
router.use('/reviews', reviewRouter);
router.use('/notifications', notificationRouter);

module.exports = router;
