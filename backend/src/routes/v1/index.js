const express = require('express');

const router = express.Router();
const authRouter = require('./auth');
const userRouter = require('./user');
const productRouter = require('./product');
const transactionRouter = require('./transaction');
const promoRouter = require('./promo');


router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/products', productRouter);
router.use('/transactions', transactionRouter);
router.use('/promos', promoRouter);


module.exports = router;
