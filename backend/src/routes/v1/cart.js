const express = require('express');
const router = express.Router();
const cartController = require('../../controller/cart/cart');
const { authMiddleware } = require('../../middlewares/authorization');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addToCart);
router.put('/', authMiddleware, cartController.updateCartItem);
router.delete('/:productId', authMiddleware, cartController.removeFromCart);

module.exports = router;
