const express = require('express');
const router = express.Router();
const cartController = require('../../controller/cart/cart');
const { authMiddleware } = require('../../middlewares/authorization');
const { checkStoreHours } = require('../../middlewares/storeHours');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', [authMiddleware, checkStoreHours], cartController.addToCart);
router.put('/', authMiddleware, cartController.updateCartItem);
router.delete('/:productId', authMiddleware, cartController.removeFromCart);
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;
