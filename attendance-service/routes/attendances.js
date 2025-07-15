
const express = require('express');
const router = express.Router();
const createUploader = require('../../shared/config/multer');
const upload = createUploader('attendance_photos');

const { checkInController, clockOutController, getMyAttendanceController, getTodayAttendanceController,
    getMyAttendanceStatsController, getAllAttendanceController, getAttendanceByIdController, getAllAttendanceStatsController
} = require('../controllers/attendanceController');

const { authenticateToken, authorizePermission, authorizeSelfOnly } = require('../../shared/middleware/auth');
// Check-in endpoint
router.post('/clock-in', authenticateToken, authorizeSelfOnly, upload.single('photo'), checkInController);
router.patch('/clock-out', authenticateToken, authorizeSelfOnly, clockOutController);
router.get('/me', authenticateToken, authorizeSelfOnly, getMyAttendanceController);
router.get('/me/today', authenticateToken, authorizeSelfOnly, getTodayAttendanceController);
router.get('/me/stats', authenticateToken, authorizeSelfOnly, getMyAttendanceStatsController);
router.get(
    '/all',
    authenticateToken,
    authorizePermission('reports', 'read'),
    getAllAttendanceController
);
router.get(
    '/stats/all',
    authenticateToken,
    authorizePermission('attendance', 'read'),
    getAllAttendanceStatsController
);
router.get(
    '/:id',
    authenticateToken,
    authorizePermission('reports', 'read'),
    getAttendanceByIdController
);

module.exports = router;





