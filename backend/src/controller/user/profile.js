const BaseResponse = require('../../common/responses/base-response');
const { StatusCodes } = require('http-status-codes');
const { createProfile, updateProfile, getProfile } = require('../../services/user/profile');
const { BaseError } = require('../../common/responses/error-response');

const getProfileController = async (req, res, next) => {
    try {
        const userId  = req.user.id;
        const result = await getProfile(userId);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'User profile retrieved successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
}

const createProfileController = async (req, res, next) => {
    try {
        const { body, files } = req;
        const  userId  = req.user.id;
        const result = await createProfile(body, files, userId);
        return res.status(StatusCodes.CREATED).json(
            new BaseResponse({
                status: StatusCodes.CREATED,
                message: 'User profile created successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
}

const updateProfileController = async (req, res, next) => {
    try {
        const { body, files } = req;
        const userId  = req.user.id;
        const result = await updateProfile(body, files, userId);
        return res.status(StatusCodes.OK).json(
            new BaseResponse({
                status: StatusCodes.OK,
                message: 'User profile updated successfully',
                data: result,
            })
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProfileController,
    updateProfileController,
    getProfileController,
};