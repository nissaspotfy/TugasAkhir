const { BaseError, NotFoundError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { user } = require('../../models');
const { 
    forgotPasswordSchema, 
    verifyCodeSchema, 
    resetPasswordSchema 
} = require('../../common/validation/auth/auth');
const { sendResetCodeEmail } = require('../../common/utils/mail');
const { encryptPassword } = require('../../common/utils/user');

const forgotPassword = async (body) => {
    const { error } = forgotPasswordSchema.validate(body);
    if (error) {
        throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
    }

    const { email } = body;
    const userExist = await user.findOne({ where: { email } });
    if (!userExist) {
        throw new NotFoundError('Akun dengan email ini tidak ditemukan');
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Code expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    userExist.reset_code = code;
    userExist.reset_expires_at = expiresAt;
    await userExist.save();

    // Send email (and print code to console)
    await sendResetCodeEmail(email, code);

    return { email };
};

const verifyCode = async (body) => {
    const { error } = verifyCodeSchema.validate(body);
    if (error) {
        throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
    }

    const { email, code } = body;
    const userExist = await user.findOne({ where: { email } });
    if (!userExist) {
        throw new NotFoundError('Akun dengan email ini tidak ditemukan');
    }

    if (!userExist.reset_code || userExist.reset_code !== code) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Kode verifikasi salah');
    }

    if (new Date() > new Date(userExist.reset_expires_at)) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Kode verifikasi telah kedaluwarsa');
    }

    return { email, code };
};

const resetPassword = async (body) => {
    const { error } = resetPasswordSchema.validate(body);
    if (error) {
        throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
    }

    const { email, code, password } = body;
    const userExist = await user.findOne({ where: { email } });
    if (!userExist) {
        throw new NotFoundError('Akun dengan email ini tidak ditemukan');
    }

    if (!userExist.reset_code || userExist.reset_code !== code) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Kode verifikasi salah atau tidak valid');
    }

    if (new Date() > new Date(userExist.reset_expires_at)) {
        throw new BaseError(StatusCodes.BAD_REQUEST, 'Kode verifikasi telah kedaluwarsa');
    }

    // Encrypt new password
    const hashedPassword = await encryptPassword(password);
    userExist.password = hashedPassword;
    userExist.reset_code = null;
    userExist.reset_expires_at = null;
    await userExist.save();

    return { email };
};

module.exports = {
    forgotPassword,
    verifyCode,
    resetPassword,
};
