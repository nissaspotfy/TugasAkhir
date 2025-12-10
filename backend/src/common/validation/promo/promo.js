const Joi = require('joi');

const createPromoSchema = Joi.object({
    code: Joi.string().required().uppercase().trim(),
    discount_type: Joi.string().valid('percentage', 'fixed').required(),
    discount_value: Joi.number().integer().min(1).required(),
    is_active: Joi.boolean().default(true),
    max_usage: Joi.number().integer().min(0).allow(null)
});

const updatePromoSchema = Joi.object({
    code: Joi.string().uppercase().trim(),
    discount_type: Joi.string().valid('percentage', 'fixed'),
    discount_value: Joi.number().integer().min(1),
    is_active: Joi.boolean(),
    max_usage: Joi.number().integer().min(0).allow(null)
});

module.exports = {
    createPromoSchema,
    updatePromoSchema
};
