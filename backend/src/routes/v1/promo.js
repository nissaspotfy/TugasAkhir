const express = require('express');
const promoController = require('../../controller/promo/promo');
const { authMiddleware } = require('../../middlewares/authorization');

const router = express.Router();

router.post('/check', authMiddleware, promoController.checkPromo);
router.post('/', authMiddleware, promoController.createPromo);
router.get('/', authMiddleware, promoController.getAllPromos);
router.get('/:id', authMiddleware, promoController.getPromoById);
router.put('/:id', authMiddleware, promoController.updatePromo);
router.delete('/:id', authMiddleware, promoController.deletePromo);

module.exports = router;