// shared/config/jwt.js
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_CONFIG = {
    ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key',
    REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    ACCESS_TOKEN_EXPIRES_IN:process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    ISSUER: process.env.JWT_ISSUER || 'employee-management-system',
    AUDIENCE: process.env.JWT_AUDIENCE || 'employee-management-users'
};

// Generate access token
const generateAccessToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            jti: uuidv4(), 
            type: 'access'
        },
        JWT_CONFIG.ACCESS_TOKEN_SECRET,
        {
            expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE
        }
    );
};

// Generate refresh token
const generateRefreshToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            jti: uuidv4(),
            type: 'refresh'
        },
        JWT_CONFIG.REFRESH_TOKEN_SECRET,
        {
            expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE
        }
    );
};

const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE
        });

        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        throw new Error(`Invalid access token: ${error.message}`);
    }
};

const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_CONFIG.REFRESH_TOKEN_SECRET, {
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE
        });

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        throw new Error(`Invalid refresh token: ${error.message}`);
    }
};

const generateTokenPair = (payload) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
        refreshTokenExpiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN
    };
};

const decodeToken = (token) => {
    try {
        return jwt.decode(token, { complete: true });
    } catch (error) {
        return null;
    }
};

const getTokenExpiration = (token) => {
    try {
        const decoded = jwt.decode(token);
        return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
        return null;
    }
};

const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

module.exports = {
    JWT_CONFIG,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokenPair,
    decodeToken,
    getTokenExpiration,
    isTokenExpired
};