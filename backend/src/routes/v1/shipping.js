const express = require('express');
const router = express.Router();
const shippingController = require('../../controller/shipping/shipping');
const { authMiddleware } = require('../../middlewares/authorization');

router.post('/cost', authMiddleware, shippingController.calculateCost);

module.exports = router;
