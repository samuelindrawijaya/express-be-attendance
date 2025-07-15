const Joi = require('joi');
const BaseError = require('../utils/errors/BaseError');

const schema = Joi.object({
    // user fields
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().trim().min(6).required(),

    // employee fields
    full_name: Joi.string().trim().min(2).max(100).required(),
    nik: Joi.string().trim().pattern(/^[a-zA-Z0-9]+$/).min(6).max(20).required()
        .messages({ 'string.pattern.base': 'NIK must be alphanumeric' }),
    department: Joi.string().trim().min(2).required(),
    position: Joi.string().trim().min(2).required(),
    phone: Joi.string().trim().pattern(/^[0-9+\-() ]{8,20}$/).required()
        .messages({ 'string.pattern.base': 'Phone must be a valid format (digits, +, -, () allowed)' }),
    address: Joi.string().trim().allow('', null),
    hire_date: Joi.date().iso().required()
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
