const Joi = require('joi');
const BaseError = require('../utils/errors/BaseError');

const schema = Joi.object({
    full_name: Joi.string().trim().min(2).max(100),
    phone: Joi.string().trim().pattern(/^[0-9+\-() ]{8,20}$/)
        .messages({ 'string.pattern.base': 'Phone format invalid' }),
    address: Joi.string().trim().allow('', null)
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
