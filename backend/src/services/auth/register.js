const { StatusCodes } = require('http-status-codes');
const  { BaseError, ConflictError, NotFoundError } = require('../../common/responses/error-response');
const { user, role } = require('../../models');
const { registerSchema } = require('../../common/validation/auth/auth');
const { encryptPassword } = require('../../common/utils/user');


const registerUser = async (body) => {
    try {
        const { error } = registerSchema.validate(body);
    if (error) {
        throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
    }

    const { name, email, password,  } = body;

    const userExist = await user.findOne({ where: { email } });
    if (userExist) {
        throw new ConflictError('User already exists');
    }

    //set role_id to 'User' role
    const userRole = await role.findOne({ where: { nama_role: 'User' } });
    if (!userRole) {
        throw new NotFoundError('Role not found');
    }

    // Encrypt password before saving to the database
    const encryptedPassword = await encryptPassword(password);

    const newUser = await user.create({ 
        name,
        email,
        password: encryptedPassword,
        role_id: userRole.id
    });

    return newUser;
} catch (error) {
    if (error instanceof BaseError) {
        throw error;
    }
    throw new BaseError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
}

const registerAdmin = async (body) => {
    try {
        const { error } = registerSchema.validate(body);
    if (error) {
        throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);

    }
    const { name, email, password,  } = body;

    const userExist = await user.findOne({ where: { email } });
    if (userExist) {
        throw new ConflictError('User already exists');
    }
    //set role_id to 'Admin' role
    const adminRole = await role.findOne({ where: { nama_role: 'Admin' } });
    if (!adminRole) {
        throw new NotFoundError('Role not found');
    }
    // Encrypt password before saving to the database
    const encryptedPassword = await encryptPassword(password);
    const newAdmin = await user.create({ 
        name,
        email,
        password: encryptedPassword,
        role_id: adminRole.id
    });
    return newAdmin;
} catch (error) {
    if (error instanceof BaseError) {
        throw error;
    }
    throw new BaseError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    registerUser,
    registerAdmin
}
