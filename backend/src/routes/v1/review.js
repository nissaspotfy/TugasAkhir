const express = require('express');
const router = express.Router();
const { createReviewController, getAllReviewsController } = require('../../controller/review/review');
const { authMiddleware, adminMiddleware } = require('../../middlewares/authorization');

router.post('/', authMiddleware, createReviewController);
router.get('/', [authMiddleware, adminMiddleware], getAllReviewsController);

module.exports = router;
