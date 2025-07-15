const BaseError = require('../utils/errors/BaseError');

class RegisterValidator {
    static validate({ name, email, password, role }) {
        if (!name || !email || !password) {
            throw new BaseError('Name, email and password are required', 400, 'MISSING_FIELDS');
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            throw new BaseError('Invalid email format', 400, 'INVALID_EMAIL');
        }

        if (password.length < 6) {
            throw new BaseError('Password must be at least 6 characters', 400, 'WEAK_PASSWORD');
        }

        const validRoles = ['employee', 'admin', 'manager', 'hr'];
        if (role && !validRoles.includes(role)) {
            throw new BaseError(`Invalid role. Allowed: ${validRoles.join(', ')}`, 400, 'INVALID_ROLE');
        }
    }
}

module.exports = RegisterValidator;
