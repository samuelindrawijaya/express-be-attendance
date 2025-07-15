const express = require('express');
const router = express.Router();
const { login, refreshAccessToken, logout, logoutAll, getLoginLogs } = require('../controllers/authController');
const { registerUser, changePassword, resetPassword, getUserByEmail, setUserActiveStatusController, getAllUsers } = require('../controllers/userController');
const { authenticateToken, adminOnly, authorizePermission } = require('../../shared/middleware/auth');
const { authLimiter } = require('../../shared/middleware/rateLimiter');
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, authenticateToken, adminOnly, registerUser);

router.post('/refresh-token', refreshAccessToken);
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.post('/change-password', authenticateToken, changePassword);
router.post('/reset-password', authenticateToken, adminOnly, resetPassword);
router.get('/login-logs', authenticateToken, adminOnly, getLoginLogs);
router.get('/users/email/:email', authenticateToken, authorizePermission('users', 'read'), getUserByEmail);
router.patch(
    '/users/:id/active',
    authenticateToken,
    authorizePermission('users', 'update'),
    setUserActiveStatusController
);
router.get(
    '/get-all-users',
    authenticateToken,
    authorizePermission('users', 'read'),
    getAllUsers
);
module.exports = router;
