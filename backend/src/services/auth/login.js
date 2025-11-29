const { BaseError,ConflictError, NotFoundError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { user } = require('../../models');
const { loginSchema } = require('../../common/validation/auth/auth');
const {comparePassword} = require('../../common/utils/user');
const { JWT_SECRET } = process.env;
const { generateToken } = require('../../common/utils/jwt');



const login = async (body) => {
    const { error } = loginSchema.validate(body);
    if (error) {
        throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
    }

    const { email, password } = body;

    const userExist = await user.findOne({ where: { email } });
    if (!userExist) {
        throw new NotFoundError('User not found');
    }

    const isPasswordValid = await comparePassword(password, userExist.password);
    if (!isPasswordValid) {
        throw new BaseError(StatusCodes.UNAUTHORIZED, 'Invalid password');
    }
    const token = generateToken({ id: userExist.id, email: userExist.email });
    const userData = {
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        token,
    };
        

    return userData;
}

module.exports = {
    login
}