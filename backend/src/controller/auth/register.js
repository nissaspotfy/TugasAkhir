const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const {
    register
} = require('../../services/auth/register');
const { BaseError } = require('../../common/responses/error-response');

const registerController = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await register(body);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'User registered successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerController,
};