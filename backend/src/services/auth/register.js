const { StatusCodes } = require('http-status-codes');
const  { BaseError, ConflictError, NotFoundError } = require('../../common/responses/error-response');
const { user } = require('../../models');
const { registerSchema } = require('../../common/validation/auth/auth');
const { encryptPassword } = require('../../common/utils/user');


const register = async (body) => {
    const { error } = registerSchema.validate(body);
    if (error) {
        throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
    }

    const { name, email, password } = body;

    const userExist = await user.findOne({ where: { email } });
    if (userExist) {
        throw new ConflictError('User already exists');
    }

    // Encrypt password before saving to the database
    const encryptedPassword = await encryptPassword(password);

    const newUser = await user.create({ 
        name,
        email,
        password: encryptedPassword,
    });

    return newUser;
}

module.exports = {
    register
}
