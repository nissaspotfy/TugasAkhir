const { user } = require('../models');
const { BaseError } = require('../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { JWT_SECRET } = process.env;
const { verifyToken, decodeToken } = require('../common/utils/jwt');

/**
 * Middleware to check if the user is authenticated
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            throw new BaseError(StatusCodes.UNAUTHORIZED, 'Token not provided');
        }

        const decoded = verifyToken(token, JWT_SECRET);
        if (decoded instanceof Error) {
            throw new BaseError(StatusCodes.UNAUTHORIZED, 'Invalid token');
        }

        const userId = decoded.id;
        const userData = await user.findByPk(userId);
        if (!userData) {
            throw new BaseError(StatusCodes.UNAUTHORIZED, 'User not found');
        }

        req.user = userData;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    authMiddleware,
};
