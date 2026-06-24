const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { getStoreStatus, updateStoreStatus } = require('../../services/setting/setting');

const getStoreStatusController = async (req, res, next) => {
    try {
        const isOpen = await getStoreStatus();
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Store status retrieved successfully',
                data: { isOpen }
            })
        );
    } catch (error) {
        next(error);
    }
};

const updateStoreStatusController = async (req, res, next) => {
    try {
        const { isOpen } = req.body;
        if (isOpen === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                new BaseResponse({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'isOpen is required',
                    data: null
                })
            );
        }
        const updatedStatus = await updateStoreStatus(isOpen);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Store status updated successfully',
                data: { isOpen: updatedStatus }
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStoreStatusController,
    updateStoreStatusController
};
