const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const shippingService = require('../../services/shipping/shipping');

const calculateCost = async (req, res, next) => {
    try {
        const { addressId, items } = req.body;
        const result = await shippingService.calculateShippingCost(addressId, items);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Shipping options calculated',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    calculateCost
};
