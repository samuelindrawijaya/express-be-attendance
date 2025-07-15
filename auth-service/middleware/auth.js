const { verifyAccessToken } = require('../../shared/config/jwt');
const createResponse = require('../../shared/utils/response');
const { User, Role } = require('../models');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json(createResponse(false, 'Access token required', null, 'MISSING_TOKEN'));
        }

        const decoded = verifyAccessToken(token);

        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, as: 'Role' }]
        });

        if (!user || !user.is_active) {
            return res.status(403).json(createResponse(false, 'Account is deactivated', null, 'INACTIVE_USER'));
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.Role?.name ?? decoded.role,
            permissions: user.Role?.permissions || decoded.permissions || {}
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        if (error.message.includes('jwt expired')) {
            return res.status(401).json(createResponse(false, 'Token expired', null, 'TOKEN_EXPIRED'));
        }

        return res.status(401).json(createResponse(false, 'Invalid token', null, 'INVALID_TOKEN'));
    }
};

module.exports = {
    authenticateToken
};
