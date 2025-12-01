const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const {
    registerUser,
    registerAdmin
} = require('../../services/auth/register');

const registerUserController = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await registerUser(body);
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

const registerAdminController = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await registerAdmin(body);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'Admin registered successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerUserController,
    registerAdminController
};