const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const {
    createTransaction,
    getUserTransactions,
    getAllTransactions,
    syncTransactionStatus,
    updateTransactionStatus,
    deleteTransaction,
    getAnalyticsData,
    cancelPendingTransaction,
    cancelCustomerTransaction
} = require('../../services/transaction/transaction');

const createTransactionController = async (req, res, next) => {
    try {
        const { items, promoCode, shippingAddressId, shippingOption, shippingType } = req.body; 
        const result = await createTransaction(req.user, items, promoCode, shippingAddressId, shippingOption, shippingType);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'Transaction created successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const getUserTransactionsController = async (req, res, next) => {
    try {
        const result = await getUserTransactions(req.user.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'User transactions retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const getAllTransactionsController = async (req, res, next) => {
    try {
        const result = await getAllTransactions();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'All transactions retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const syncTransactionStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await syncTransactionStatus(id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Transaction status synchronized successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const updateTransactionStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await updateTransactionStatus(id, status);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Transaction status updated successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const deleteTransactionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await deleteTransaction(id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Transaction deleted successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const getAnalyticsController = async (req, res, next) => {
    try {
        const result = await getAnalyticsData();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Analytics data retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const cancelPendingTransactionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await cancelPendingTransaction(id, req.user.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Pending transaction cancelled and deleted successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const cancelCustomerTransactionController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await cancelCustomerTransaction(id, req.user.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Transaction cancelled successfully by customer',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransactionController,
    getUserTransactionsController,
    getAllTransactionsController,
    syncTransactionStatusController,
    updateTransactionStatusController,
    deleteTransactionController,
    getAnalyticsController,
    cancelPendingTransactionController,
    cancelCustomerTransactionController
};
