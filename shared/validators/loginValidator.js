const BaseError = require('../utils/errors/BaseError');

class LoginValidator {
    static validate({ email, password }) {
        if (!email || !password) {
            throw new BaseError('Email and password are required', 400, 'MISSING_CREDENTIALS');
        }
        const regex = /^\S+@\S+\.\S+$/;
        if(!regex.test(email)) {
            throw new BaseError('Invalid email format', 400, 'INVALID_EMAIL');
        };
    }
}

module.exports = LoginValidator;
