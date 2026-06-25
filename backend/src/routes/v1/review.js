const express = require('express');
const router = express.Router();
const { 
    createReviewController, 
    getAllReviewsController,
    getHomepageReviewsController,
    toggleReviewHomepageController
} = require('../../controller/review/review');
const { authMiddleware, adminMiddleware } = require('../../middlewares/authorization');

router.post('/', authMiddleware, createReviewController);
router.get('/', [authMiddleware, adminMiddleware], getAllReviewsController);
router.get('/homepage', getHomepageReviewsController);
router.put('/:id/toggle-homepage', [authMiddleware, adminMiddleware], toggleReviewHomepageController);

module.exports = router;
