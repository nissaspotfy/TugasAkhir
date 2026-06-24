const express = require('express');
const router = express.Router();
const { getStoreStatusController, updateStoreStatusController } = require('../../controller/setting/setting');
const { authMiddleware, adminMiddleware } = require('../../middlewares/authorization');

router.get('/store-status', getStoreStatusController);
router.put('/store-status', [authMiddleware, adminMiddleware], updateStoreStatusController);

module.exports = router;
