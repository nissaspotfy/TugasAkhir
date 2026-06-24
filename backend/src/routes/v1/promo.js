const express = require('express');
const promoController = require('../../controller/promo/promo');
const { authMiddleware, adminMiddleware } = require('../../middlewares/authorization');

const router = express.Router();

router.post('/check', authMiddleware, promoController.checkPromo);
router.post('/', [authMiddleware, adminMiddleware], promoController.createPromo);
router.get('/', authMiddleware, promoController.getAllPromos);
router.get('/:id', [authMiddleware, adminMiddleware], promoController.getPromoById);
router.put('/:id', [authMiddleware, adminMiddleware], promoController.updatePromo);
router.delete('/:id', [authMiddleware, adminMiddleware], promoController.deletePromo);

module.exports = router;