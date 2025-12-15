const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const {
    createTransaction,
    getUserTransactions
} = require('../../services/transaction/transaction');

const createTransactionController = async (req, res, next) => {
    try {
        // req.user is populated by authorization middleware
        const { items, promoCode, shippingAddressId, shippingOption } = req.body; 
        const result = await createTransaction(req.user, items, promoCode, shippingAddressId, shippingOption);
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

module.exports = {
    createTransactionController,
    getUserTransactionsController
};
