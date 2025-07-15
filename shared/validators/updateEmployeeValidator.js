const Joi = require('joi');
const BaseError = require('../utils/errors/BaseError');

const schema = Joi.object({
    full_name: Joi.string().trim().min(2).max(100),
    nik: Joi.string().trim().alphanum().min(6).max(20)
        .messages({ 'string.pattern.base': 'NIK must be alphanumeric' }),
    phone: Joi.string().trim().pattern(/^[0-9+\-() ]{8,20}$/)
        .messages({ 'string.pattern.base': 'Phone format invalid' }),
    address: Joi.string().trim().allow('', null),
    department: Joi.string().trim().min(2),
    position: Joi.string().trim().min(2),
    hire_date: Joi.date().iso(),
    status: Joi.string().valid('active', 'inactive')
});

const validate = (data) => {
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
        throw new BaseError(
            'Validation error',
            400,
            'VALIDATION_ERROR',
            error.details.map(d => d.message).join(', ')
        );
    }
};

module.exports = {
    validate
};
