const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { getAllCustomers, deleteUserAccount } = require('../../services/user/user');

const getAllCustomersController = async (req, res, next) => {
    try {
        const result = await getAllCustomers();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'All customers retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const deleteUserAccountController = async (req, res, next) => {
    try {
        await deleteUserAccount(req.user.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Account deleted successfully',
                data: null,
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCustomersController,
    deleteUserAccountController
};
