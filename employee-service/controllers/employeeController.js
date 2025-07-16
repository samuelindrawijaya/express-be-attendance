const { createEmployeeWithUser , getMyProfile, getEmployeeById, updateMyProfile, updateEmployeeById, terminateEmployee,
    searchEmployees
} = require('../services/employeeService');
const { createResponse } = require('../../shared/utils/response');

const fs = require('fs');
const path = require('path');
const { validate: EmployeeWithUserValidator } = require('../../shared/validators/employeeWithUserValidator');
const { validate: UpdateEmployeeValidator } = require('../../shared/validators/updateEmployeeValidator');
const { validate: UpdateMyProfileValidator } = require('../../shared/validators/updateMyProfileValidator');

const createEmployeeWithUserController = async (req, res) => {
    try {
        EmployeeWithUserValidator(req.body);

        const result = await createEmployeeWithUser(req.body, req.file, req);

        return res.status(201).json(
            createResponse(true, 'User and Employee created successfully', result)
        );
    } catch (error) {
        console.error('Create employee with user error:', error);

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'CREATE_WITH_USER_FAILED')
        );
    }
};

const updateMyProfileController = async (req, res) => {
    try {
        UpdateMyProfileValidator(req.body); // ✅ validasi dulu

        const userId = req.user.id;
        const result = await updateMyProfile(userId, req.body, req.file);

        return res.status(200).json(
            createResponse(true, 'Profile updated successfully', result)
        );
    } catch (error) {
        console.error('Update profile error:', error);

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'UPDATE_PROFILE_FAILED')
        );
    }
};



const getMyProfileController = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await getMyProfile(userId);

        return res.status(200).json(
            createResponse(true, 'Profile fetched successfully', profile)
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'GET_PROFILE_FAILED')
        );
    }
};
const getEmployeeByIdController = async (req, res) => {
    try {
        const employee = await getEmployeeById(req.params.id);

        return res.status(200).json(
            createResponse(true, 'Employee profile fetched successfully', employee)
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'GET_EMPLOYEE_FAILED')
        );
    }
};

const terminateEmployeeController = async (req, res) => {
    try {
        const employeeId = req.params.id;

        await terminateEmployee(employeeId, req);

        return res.status(200).json(
            createResponse(true, 'Employee terminated successfully')
        );
    } catch (error) {
        console.error('Terminate employee error:', error);

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'TERMINATE_EMPLOYEE_FAILED')
        );
    }
};

const updateEmployeeByIdController = async (req, res) => {
    try {
        console.log(req.body);
        UpdateEmployeeValidator(req.body);
        const result = await updateEmployeeById(req.params.id, req.body, req.file);
        
        return res.status(200).json(
            createResponse(true, 'Employee updated successfully', result)
        );
    } catch (error) {
        console.error('Update employee error:', error);

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); // Hapus foto jika gagal
        }

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'UPDATE_EMPLOYEE_FAILED')
        );
    }
};

const searchEmployeesController = async (req, res) => {
    try {
        const result = await searchEmployees(req.query);

        return res.status(200).json(
            createResponse(true, 'Employees fetched successfully', result)
        );
    } catch (error) {
        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'GET_EMPLOYEES_FAILED')
        );
    }
};

module.exports = {
    getMyProfileController,
    getEmployeeByIdController,
    updateMyProfileController,
    updateEmployeeByIdController,
    terminateEmployeeController,
    searchEmployeesController,
    createEmployeeWithUserController
};

