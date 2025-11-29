const JOI = require('joi');

const registerSchema = JOI.object({
    name: JOI.string().min(3).max(30).required(),
    email: JOI.string().email().required(),
    password: JOI.string().min(8)
        .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one letter, one number, and one special character.',
        }),
    confirm_password: JOI.string().valid(JOI.ref('password')).required()
        .messages({ 'any.only': 'Passwords do not match.' }),
});


const loginSchema = JOI.object({
    email: JOI.string().email().required(),
    password: JOI.string().required(),
});

module.exports = {
    registerSchema,
    loginSchema,
};