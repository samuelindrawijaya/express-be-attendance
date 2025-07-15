const BaseError = require("../utils/errors/BaseError");

const validateEmail = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const isStrongPassword = (password) => {
    console.log('Validating password strength:', password);
    if (!passwordRegex.test(password)) {
        console.log('Password validation failed');
        throw new BaseError(
            'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
            400,
            'WEAK_PASSWORD'
        );
    }
};

const ChangePasswordValidator = {
    validate({ currentPassword, newPassword }) {
        if (!currentPassword || !newPassword) {
            throw new BaseError('Current and new password are required', 400, 'MISSING_PASSWORD');
        }

        console.log(newPassword);
        isStrongPassword(newPassword);
    }
};
module.exports = {
    validateEmail,
    isStrongPassword,
    ChangePasswordValidator
};
