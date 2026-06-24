const JOI = require('joi');

const profileSchema = JOI.object({
    username: JOI.string().alphanum().min(3).max(30).required(),
    bio : JOI.string().max(160).optional(),
    profilePicture: JOI.string().uri().optional(),
    dateOfBirth: JOI.date().iso().optional(),
});

const updateProfileSchema = JOI.object({
    username: JOI.string().alphanum().min(3).max(30).optional(),
    bio: JOI.string().max(160).optional(),
    profilePicture: JOI.string().uri().optional(),
    dateOfBirth: JOI.date().iso().optional(),
    full_name: JOI.string().max(100).optional(),
    email: JOI.string().email().optional(),
    notification_promo: JOI.boolean().optional(),
    notification_status: JOI.boolean().optional(),
});

module.exports = {
    profileSchema,
    updateProfileSchema,
};