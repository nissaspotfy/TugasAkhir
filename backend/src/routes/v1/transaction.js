const express = require('express');
const router = express.Router();
const {
    createTransactionController,
    getUserTransactionsController
} = require('../../controller/transaction/transaction');
const { authMiddleware } = require('../../middlewares/authorization');

router.post('/', authMiddleware, createTransactionController);
router.get('/my-transactions', authMiddleware, getUserTransactionsController);

module.exports = router;
