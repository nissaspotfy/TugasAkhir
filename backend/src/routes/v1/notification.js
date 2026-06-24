const express = require('express');
const router = express.Router();
const {
    getUserNotificationsController,
    markAsReadController,
    markAllAsReadController
} = require('../../controller/notification/notification');
const { authMiddleware } = require('../../middlewares/authorization');

router.get('/', authMiddleware, getUserNotificationsController);
router.post('/read-all', authMiddleware, markAllAsReadController);
router.post('/:id/read', authMiddleware, markAsReadController);

module.exports = router;
