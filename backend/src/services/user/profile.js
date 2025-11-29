const { user, profile } = require('../../models');
const { BaseError } = require('../../common/responses/error-response');
const { StatusCodes } = require('http-status-codes');
const { profileSchema, updateProfileSchema } = require('../../common/validation/user/profile');
const { NotFoundError } = require('../../common/responses/error-response');
const fs = require('fs');
const path = require('path');




/**
 * @description Create a new user profile
 * @param {Object} body - The request body containing profile data
 * @param {Object} files - The uploaded files
 * @param {string} userId - The ID of the user
 * @return {Promise<Object>} - The created profile object
 * @throws {BaseError} - If validation fails or user not found
 * @throws {NotFoundError} - If the user does not exist
 * @throws {BaseError} - If the profile already exists
 * @throws {BaseError} - If the profile creation fails
*/



//get user profile

const getProfile = async (userId) => {
    const userExist = await user.findByPk(userId);
    if (!userExist) {
        throw new NotFoundError('User not found');
    }
    const profileExist = await profile.findOne({ where: { userId } });
    if (!profileExist) {
        throw new NotFoundError('Profile not found');
    }
    const profileData = {
        id: profileExist.id,
        username: profileExist.username,
        bio: profileExist.bio,
        dateOfBirth: profileExist.dateOfBirth,
        profilePicture: profileExist.profilePicture ? `${process.env.BASE_URL}${profileExist.profilePicture}` : null,
    };
    return profileData;
}

const createProfile = async (body, files, userId) => {
    try {
        const { error } = updateProfileSchema.validate(body);
        if (error) {
            throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
        }

        const { username, bio, dateOfBirth } = body;
        const userExist = await user.findByPk(userId);
        if (!userExist) {
            throw new NotFoundError('User not found');
        }
        const profileExist = await profile.findOne({ where: { userId } });
        if (profileExist) {
            throw new BaseError(StatusCodes.CONFLICT, 'Profile already exists');
        }

        const profilePicture = files && files['profile_picture'] ? files['profile_picture'][0].path.replace(/\\/g, '/') : null;
        const profilePictureFile = profilePicture.split('/public')[1];
        const newProfile = await profile.create({
            userId,
            username,
            bio,
            profilePicture: profilePictureFile,
            dateOfBirth,
        });
        return newProfile;
        
    } catch (error) {
        // Handle uploaded file when an error occurs
        if (files && files['profile_picture']) {
            const profilePicturePath = files['profile_picture'][0].path.replace(/\\/g, '/');
            fs.unlink(profilePicturePath, (err) => {
                if (err) {
                    console.error('Error deleting uploaded profile picture:', err);
                }
            });
        }

        throw new BaseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating profile : ' + error.message);
        
    }
}

const updateProfile = async (body, files, userId) => {
    try {
        const { error } = profileSchema.validate(body);
        if (error) {
            throw new BaseError(StatusCodes.BAD_REQUEST, error.details[0].message);
        }

        const { username, bio, dateOfBirth } = body;
        const userExist = await user.findByPk(userId);
        if (!userExist) {
            throw new NotFoundError('User not found');
        }
        const profileExist = await profile.findOne({ where: { userId } });
        if (!profileExist) {
            throw new NotFoundError('Profile not found');
        }
        // Check if the profile picture is provided in the request
        let profilePicture = profileExist.profilePicture;
        if (files && files['profile_picture']) {
            //delete the old profile picture if it exists
            if (profileExist.profilePicture) {
                const oldProfilePicturePath = path.join(process.cwd(), 'public' ,profileExist.profilePicture);
                console.log('Deleting old profile picture:', oldProfilePicturePath);
                fs.existsSync(oldProfilePicturePath) && fs.unlinkSync(oldProfilePicturePath);
            }
            profilePicture = files['profile_picture'][0].path.replace(/\\/g, '/');
            const profilePictureFile = profilePicture.split('/public')[1];
            profilePicture = profilePictureFile;
        }
        await profile.update({
            username,
            bio,
            profilePicture,
            dateOfBirth,
        }, { where: { userId } });
        const updatedProfile = await profile.findOne({ where: { userId } });
        return updatedProfile;
    } catch (error) {
        // Handle uploaded file when an error occurs
        if (files && files['profile_picture']) {
            const profilePicturePath = files['profile_picture'][0].path;
            fs.unlink(profilePicturePath, (err) => {
                if (err) {
                    console.error('Error deleting uploaded profile picture:', err);
                }
            });
        }

        throw new BaseError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error updating profile : ' + error.message);
    }
}

module.exports = {
    createProfile,
    getProfile,
    updateProfile,
};