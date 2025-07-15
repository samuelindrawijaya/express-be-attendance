const LoginValidator = require('../../shared/validators/loginValidator');
const { createResponse } = require('../../shared/utils/response');
const authService = require('../services/authService');
const BaseError = require('../../shared/utils/errors/BaseError');

async function login(req, res) {
    try {
        LoginValidator.validate(req.body);

        const { email, password } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        const result = await authService.login(email, password, ipAddress, userAgent);

        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json(
            createResponse(true, 'Login successful', {
                employee: result.employee,
                accessToken: result.tokens.accessToken,
                accessTokenExpiresIn: result.tokens.accessTokenExpiresIn
            })
        );
    } catch (error) {
        console.error('Login error:', error);

        if (error.message.includes('Invalid email or password')) {
            return res.status(401).json(
                createResponse(false, 'Invalid email or password', null, 'INVALID_CREDENTIALS')
            );
        }

        res.status(error.statusCode || 500).json(
            createResponse(false, error.message || 'Login failed', null, error.code || 'LOGIN_ERROR')
        );
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new BaseError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
        }

        const tokens = await authService.refreshToken(refreshToken);

        // Set new refresh token cookie (rotate)
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json(
            createResponse(true, 'Token refreshed successfully', {
                accessToken: tokens.accessToken,
                accessTokenExpiresIn: tokens.accessTokenExpiresIn
            })
        );
    } catch (error) {
        console.error('Refresh token error:', error);

        return res.status(401).json(
            createResponse(false, error.message || 'Token refresh failed', null, 'REFRESH_FAILED')
        );
    }
};


const logout = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new BaseError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
        }

        await authService.logout(refreshToken, req.user.id);

        return res.json(
            createResponse(true, 'Logged out successfully', null)
        );
    } catch (error) {
        console.error('Logout error:', error);

        return res.status(500).json(
            createResponse(false, error.message || 'Logout failed', null, 'LOGOUT_FAILED')
        );
    }
};

const logoutAll = async (req, res) => {
    try {
        await authService.logoutAll(req.user.id);

        return res.json(
            createResponse(true, 'Logged out from all devices', null)
        );
    } catch (error) {
        console.error('LogoutAll error:', error);

        return res.status(500).json(
            createResponse(false, error.message || 'Logout all failed', null, 'LOGOUT_ALL_FAILED')
        );
    }
};

const getLoginLogs = async (req, res) => {
    try {
        const result = await authService.getLoginLogs(req.query);

        return res.json(
            createResponse(true, 'Login logs fetched', result)
        );
    } catch (error) {
        console.error('Get logs error:', error);

        return res.status(500).json(
            createResponse(false, 'Failed to fetch logs', null, 'FETCH_LOGS_FAILED')
        );
    }
};



module.exports = { login, refreshAccessToken, logout, logoutAll, getLoginLogs };
