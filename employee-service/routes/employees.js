const express = require('express');
const router = express.Router();
const multer = require('multer');
const createUploader = require('../../shared/config/multer');
const upload = createUploader('employee_photos');
const { createEmployeeWithUserController, getMyProfileController, getEmployeeByIdController, updateMyProfileController, updateEmployeeByIdController,
    searchEmployeesController, terminateEmployeeController
} = require('../controllers/employeeController');
const { authenticateToken, authorizePermission, authorizeSelfOnly } = require('../../shared/middleware/auth');
const { generalLimiter } = require('../../shared/middleware/rateLimiter');

router.post(
    '/',
    authenticateToken,
    authorizePermission('employees', 'create'),
    upload.single('photo'),
    createEmployeeWithUserController
);

router.get('/profile', generalLimiter, authenticateToken, authorizeSelfOnly, getMyProfileController);
router.put('/profile', generalLimiter, authenticateToken, authorizeSelfOnly, upload.single('photo'), updateMyProfileController);


const { Employee } = require('../models');
const { Op } = require('sequelize');
const { createResponse } = require('../../shared/utils/response');

router.get('/bulk', authenticateToken, authorizePermission('employees', 'read'), async (req, res) => {
    try {
        console.log('MASUK SINI');
        console.log('=== BULK ROUTE DEBUG ===');
        console.log('Full req.query:', JSON.stringify(req.query, null, 2));
        console.log('req.query.ids type:', typeof req.query.ids);
        console.log('req.query.ids value:', req.query.ids);
        
        let ids = [];
        
        if (Array.isArray(req.query.ids)) {
            ids = req.query.ids;
            console.log('Detected as array:', ids);
        } else if (req.query.ids) {
            ids = [req.query.ids];
            console.log('Detected as single value:', ids);
        }
        
        console.log('Final processed ids:', ids);
        console.log('ids.length:', ids.length);
        
        if (ids.length === 0) {
            console.log('Returning 400 - No IDs provided');
            return res.status(400).json(createResponse(false, 'No IDs provided', null, 'NO_IDS'));
        }
        
        console.log('Proceeding to database query with ids:', ids);
        
        const employees = await Employee.findAll({
            where: { user_id: { [Op.in]: ids } },
            attributes: ['id', 'full_name', 'department', 'position'],
        });
        
        console.log('Database query result:', employees);
        
        return res.status(200).json(createResponse(true, 'Employees fetched', employees));
    } catch (error) {
        console.error('Bulk fetch error:', error);
        return res.status(500).json(createResponse(false, 'Failed to fetch employees', null, 'FETCH_FAILED'));
    }
});

router.get(
    '/:id',
    authenticateToken,
    authorizePermission('employees', 'read'),
    getEmployeeByIdController
);

router.put(
    '/:id',
    authenticateToken,
    authorizePermission('employees', 'update'),
    upload.single('photo'),
    updateEmployeeByIdController
);

router.get(
    '/',
    authenticateToken,
    authorizePermission('employees', 'read'),
    searchEmployeesController
);

router.delete(
    '/:id',
    authenticateToken,
    authorizePermission('employees', 'delete'),
    terminateEmployeeController
);


module.exports = router;
