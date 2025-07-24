const { verifyAccessToken } = require('../config/jwt');
const { createResponse } = require('../../shared/utils/response');

// Middleware: Authenticate Access Token
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json(createResponse(false, 'Access token required', null, 'MISSING_TOKEN'));
        }

        const decoded = verifyAccessToken(token);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions || {}
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

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(createResponse(false, 'Authentication required', null, 'AUTHENTICATION_REQUIRED'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json(createResponse(false, 'Insufficient permissions', null, 'INSUFFICIENT_PERMISSIONS'));
        }

        next();
    };
};

const authorizePermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(
                createResponse(false, 'Authentication required', null, 'AUTHENTICATION_REQUIRED')
            );
        }

        const permissions = req.user.permissions || {};
        const resourcePermissions = permissions[resource] || [];

        if (!resourcePermissions.includes(action)) {
            return res.status(403).json(
                createResponse(false, `Permission denied: ${resource}:${action}`, null, 'PERMISSION_DENIED')
            );
        }

        next();
    };
};

const authorizeEmployeeAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(
            createResponse(false, 'Authentication required', null, 'AUTHENTICATION_REQUIRED')
        );
    }

    const targetEmployeeId = req.params.employeeId || req.params.id;
    const currentUserId = req.user.id;

    const hasPermission =
        targetEmployeeId === currentUserId ||
        (req.user.permissions.employees?.includes('read')) ||
        ['admin', 'manager', 'hr'].includes(req.user.role);

    if (!hasPermission) {
        return res.status(403).json(
            createResponse(false, 'Access denied to employee data', null, 'EMPLOYEE_ACCESS_DENIED')
        );
    }

    next();
};

const authorizeSelfOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(createResponse(false, 'Unauthorized', null, 'UNAUTHORIZED'));
    }
    next();
};


const adminOnly = authorizeRole('admin');
const managerAndAbove = authorizeRole('admin', 'manager');
const hrAccess = authorizeRole('admin', 'hr');

module.exports = {
    authenticateToken,
    authorizeRole,
    authorizePermission,
    authorizeEmployeeAccess,
    adminOnly,
    managerAndAbove,
    hrAccess,
    authorizeSelfOnly
};
