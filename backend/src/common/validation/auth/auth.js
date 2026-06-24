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

const forgotPasswordSchema = JOI.object({
    email: JOI.string().email().required(),
});

const verifyCodeSchema = JOI.object({
    email: JOI.string().email().required(),
    code: JOI.string().length(4).pattern(/^\d{4}$/).required().messages({
        'string.pattern.base': 'Kode verifikasi harus berupa 4 digit angka.'
    }),
});

const resetPasswordSchema = JOI.object({
    email: JOI.string().email().required(),
    code: JOI.string().length(4).pattern(/^\d{4}$/).required(),
    password: JOI.string().min(8)
        .pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
        .required()
        .messages({
            'string.pattern.base': 'Kata sandi harus minimal 8 karakter, terdapat angka, dan minimal 1 huruf kapital.',
        }),
    confirm_password: JOI.string().valid(JOI.ref('password')).required()
        .messages({ 'any.only': 'Konfirmasi kata sandi tidak cocok.' }),
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyCodeSchema,
    resetPasswordSchema,
};