const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { 
    forgotPassword, 
    verifyCode, 
    resetPassword 
} = require('../../services/auth/forgot-password');

const forgotPasswordController = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await forgotPassword(body);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Kode verifikasi telah dikirim ke email Anda',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const verifyCodeController = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await verifyCode(body);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Kode verifikasi berhasil dikonfirmasi',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

const resetPasswordController = async (req, res, next) => {
    try {
        const { body } = req;
        const result = await resetPassword(body);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'Kata sandi berhasil direset',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    forgotPasswordController,
    verifyCodeController,
    resetPasswordController,
};
