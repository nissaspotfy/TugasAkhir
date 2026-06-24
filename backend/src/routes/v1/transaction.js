const express = require('express');
const router = express.Router();
const {
    createTransactionController,
    getUserTransactionsController,
    getAllTransactionsController,
    syncTransactionStatusController,
    updateTransactionStatusController,
    deleteTransactionController,
    getAnalyticsController,
    cancelPendingTransactionController,
    cancelCustomerTransactionController
} = require('../../controller/transaction/transaction');
const { authMiddleware, adminMiddleware } = require('../../middlewares/authorization');
const { checkStoreHours } = require('../../middlewares/storeHours');

router.post('/', [authMiddleware, checkStoreHours], createTransactionController);
router.get('/my-transactions', authMiddleware, getUserTransactionsController);
router.get('/analytics', [authMiddleware, adminMiddleware], getAnalyticsController);
router.post('/:id/sync', authMiddleware, syncTransactionStatusController);
router.post('/:id/cancel-pending', authMiddleware, cancelPendingTransactionController);
router.post('/:id/cancel-customer', authMiddleware, cancelCustomerTransactionController);

router.get('/', [authMiddleware, adminMiddleware], getAllTransactionsController);
router.put('/:id', [authMiddleware, adminMiddleware], updateTransactionStatusController);
router.delete('/:id', [authMiddleware, adminMiddleware], deleteTransactionController);

module.exports = router;
