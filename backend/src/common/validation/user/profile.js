const JOI = require('joi');

const profileSchema = JOI.object({
    username: JOI.string().alphanum().min(3).max(30).required(),
    bio : JOI.string().max(160).optional(),
    profilePicture: JOI.string().uri().optional(),
    dateOfBirth: JOI.date().iso().optional(),
});

const updateProfileSchema = profileSchema.fork(
    ['username', 'bio', 'profilePicture', 'dateOfBirth'], 
    (field) => field.optional() // Perbaikan di sini
);

module.exports = {
    profileSchema,
    updateProfileSchema,
};