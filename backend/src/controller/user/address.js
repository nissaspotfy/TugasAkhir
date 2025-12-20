const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const addressService = require('../../services/user/address');

const addAddress = async (req, res, next) => {
    try {
        const result = await addressService.addAddress(req.user.id, req.body);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'Address added successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const getAddresses = async (req, res, next) => {
    try {
        const result = await addressService.getUserAddresses(req.user.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Addresses retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const result = await addressService.updateAddress(req.user.id, req.params.id, req.body);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Address updated successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        await addressService.deleteAddress(req.user.id, req.params.id);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Address deleted successfully',
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress
};
