const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { login } = require('../../services/auth/login');
const { BaseError } = require('../../common/responses/error-response');



const loginController = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await login(body);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'User logged in successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    loginController,
};