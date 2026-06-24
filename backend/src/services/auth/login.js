const { BaseError,ConflictError, NotFoundError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { user, role, profile } = require('../../models');
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

    const userExist = await user.findOne({ 
        where: { email },
        include: [
            {
                model: role,
                as: 'role'
            },
            {
                model: profile,
                as: 'profiles'
            }
        ]
    });
    if (!userExist) {
        throw new NotFoundError('Akun tidak ditemukan');
    }

    const isPasswordValid = await comparePassword(password, userExist.password);
    if (!isPasswordValid) {
        throw new BaseError(StatusCodes.UNAUTHORIZED, 'Kata sandi salah');
    }
    const token = generateToken({ id: userExist.id, email: userExist.email });
    const primaryProfile = userExist.profiles?.[0];
    const profilePicture = primaryProfile?.profilePicture 
        ? `${process.env.BASE_URL}${primaryProfile.profilePicture}` 
        : null;

    const userData = {
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        role: userExist.role ? userExist.role.nama_role : null,
        profilePicture,
        token,
    };
        

    return userData;
}

module.exports = {
    login
}