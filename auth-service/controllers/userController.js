const RegisterValidator = require('../../shared/validators/registerValidator');
const authService = require('../services/authService');
const { createResponse } = require('../../shared/utils/response');
const BaseError = require('../../shared/utils/errors/BaseError');
const { isStrongPassword, ChangePasswordValidator } = require('../../shared/validators/changePasswordValidator');
const registerUser = async (req, res, next) => {
    try {

        RegisterValidator.validate(req.body);


        const { name, email, password, role } = req.body;

        const user = await authService.register(name, email, password, role);

        return res.status(201).json(
            createResponse(true, 'User registered successfully', user)
        );
    } catch (error) {
        console.error('Register error:', error);

        if (error instanceof BaseError) {
            return res.status(error.statusCode).json(
                createResponse(false, error.message, null, error.code)
            );
        }

        return res.status(500).json(
            createResponse(false, 'Registration failed', null, 'REGISTER_ERROR')
        );
    }
};

const changePassword = async (req, res) => {
    try {
        console.log(req.body);
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new BaseError('Current and new password are required', 400, 'MISSING_PASSWORD');
        }

        ChangePasswordValidator.validate({ currentPassword, newPassword });

        await authService.changePassword(req.user.id, currentPassword, newPassword);

        return res.json(
            createResponse(true, 'Password changed successfully', null)
        );
    } catch (error) {
        console.error('Change password error:', error);

        return res.status(400).json(
            createResponse(false, error.message || 'Change password failed', null, 'CHANGE_PASSWORD_FAILED')
        );
    }
};

const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json(
                createResponse(false, 'Email is required', null, 'MISSING_EMAIL')
            );
        }

        const user = await authService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json(
                createResponse(false, 'User not found', null, 'USER_NOT_FOUND')
            );
        }

        return res.json(
            createResponse(true, 'User found', user)
        );
    } catch (error) {
        console.error('Get user by email error:', error);

        return res.status(500).json(
            createResponse(false, 'Failed to get user', null, 'GET_USER_FAILED')
        );
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await authService.getAllUsers();

        return res.json(
            createResponse(true, 'Users fetched successfully', users)
        );
    } catch (error) {
        console.error('Get all users error:', error);

        return res.status(500).json(
            createResponse(false, 'Failed to get users', null, 'GET_USERS_FAILED')
        );
    }
};

const setUserActiveStatusController = async (req, res) => {
    try {
        const userId = req.params.id;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json(
                createResponse(false, 'is_active must be a boolean (true/false)', null, 'INVALID_STATUS_TYPE')
            );
        }

        const user = await authService.setUserActiveStatus(userId, is_active);

        return res.status(200).json(
            createResponse(true, `User ${is_active ? 'activated' : 'deactivated'} successfully`, {
                id: user.id,
                email: user.email,
                is_active: user.is_active
            })
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'UPDATE_USER_STATUS_FAILED')
        );
    }
};
const resetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        if (!userId || !newPassword) {
            throw new BaseError('User ID and new password are required', 400, 'MISSING_FIELDS');
        }

        isStrongPassword(newPassword);

        await authService.resetPassword(userId, newPassword, req.user.id); // req.user.id = admin

        return res.json(
            createResponse(true, 'Password reset successfully', null)
        );
    } catch (error) {
        console.error('Reset password error:', error);

        return res.status(400).json(
            createResponse(false, error.message || 'Reset password failed', null, 'RESET_PASSWORD_FAILED')
        );
    }
};

module.exports = {
    registerUser,
    changePassword,
    resetPassword,
    getUserByEmail,
    setUserActiveStatusController,
    getAllUsers
}