const axios = require('axios');
const { Employee } = require('../models');
const { Op } = require('sequelize');
const BaseError = require('../../shared/utils/errors/BaseError');
const fs = require('fs');
const path = require('path');

async function createEmployeeWithUser(data, file, req) {
    const {
        name,
        email,
        password,
        full_name,
        nik,
        department,
        position,
        phone,
        address,
        hire_date
    } = data;

    if (!email || !password || !full_name || !nik || !name) {
        throw new BaseError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    const token = req.headers.authorization;

    if (!token) {
        throw new BaseError('Unauthorized: no token provided', 401, 'TOKEN_MISSING');
    }

    let user;
    try {
        // 1. Register user di auth-service
        const userRes = await axios.post(
            `http://localhost:4002/api/auth/register`,
            { name, email, password },
            { headers: { Authorization: token } }
        );
        user = userRes?.data?.data;
    } catch (error) {
        const msg = error?.response?.data?.message || 'User registration failed';
        const code = error?.response?.data?.code || 'USER_REGISTRATION_FAILED';
        throw new BaseError(msg, error?.response?.status || 500, code);
    }

    if (!user?.id) {
        throw new BaseError('User creation failed', 500, 'USER_CREATION_FAILED');
    }

    // 2. Cek apakah Employee sudah ada
    const exists = await Employee.findOne({
        where: {
            user_id: user.id,
            status: 'active'
        }
    });

    if (exists) {
        throw new BaseError('Employee already exists for this user', 409, 'EMPLOYEE_EXISTS');
    }

    // 3. (Opsional) Cek NIK unik
    const nikExists = await Employee.findOne({ where: { nik } });
    if (nikExists) {
        throw new BaseError('NIK already registered', 409, 'NIK_EXISTS');
    }

    // 4. Buat Employee
    const newEmployee = await Employee.create({
        user_id: user.id,
        full_name,
        nik,
        department,
        position,
        phone,
        address,
        hire_date,
        photo: file?.filename || null
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        employee: {
            id: newEmployee.id,
            full_name: newEmployee.full_name,
            department: newEmployee.department,
            position: newEmployee.position,
            photo_url: newEmployee.photo
                ? `http://localhost:4003/employee-photos/${newEmployee.photo}`
                : null
        }
    };
}


async function getMyProfile(userId) {
    const employee = await Employee.findOne({
        where: { user_id: userId },
        status: 'active'
    });

    if (!employee) {
        throw new BaseError('Employee profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    return {
        employee_id: employee.id,
        user_id: employee.user_id,
        full_name: employee.full_name,
        nik: employee.nik,
        department: employee.department,
        position: employee.position,
        phone: employee.phone,
        address: employee.address,
        hire_date: employee.hire_date,
        status: employee.status,
        photo_url: employee.photo
            ? `http://localhost:4003/employee-photos/${employee.photo}`
            : null
    };
}

async function getEmployeeById(employeeId) {
    const employee = await Employee.findOne({
        where: {
            id: employeeId,
            status: 'active'
        }
    });

    if (!employee) {
        throw new BaseError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
    }

    return {
        employee_id: employee.id,
        user_id: employee.user_id,
        full_name: employee.full_name,
        nik: employee.nik,
        department: employee.department,
        position: employee.position,
        phone: employee.phone,
        address: employee.address,
        hire_date: employee.hire_date,
        status: employee.status,
        photo_url: employee.photo
            ? `http://localhost:4003/employee-photos/${employee.photo}`
            : null
    };
}

async function updateMyProfile(userId, data, file) {
    const employee = await Employee.findOne({ where: { user_id: userId } });

    if (!employee) {
        throw new BaseError('Employee profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    if (file?.filename && employee.photo) {
        const oldPath = path.join(__dirname, '../../uploads/employee_photos', employee.photo);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    const {
        full_name,
        phone,
        address
    } = data;

    await employee.update({
        full_name: full_name || employee.full_name,
        phone: phone || employee.phone,
        address: address || employee.address,
        photo: file?.filename || employee.photo
    });

    return {
        employee_id: employee.id,
        full_name: employee.full_name,
        phone: employee.phone,
        address: employee.address,
        photo_url: employee.photo
            ? `http://localhost:4003/employee-photos/${employee.photo}`
            : null
    };
}

async function updateEmployeeById(employeeId, data, file) {
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
        throw new BaseError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
    }

    // Hapus foto lama jika ada dan diganti
    if (file?.filename && employee.photo) {
        const oldPath = path.join(__dirname, '../../uploads/employee_photos', employee.photo);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    const {
        full_name,
        nik,
        department,
        position,
        phone,
        address,
        hire_date,
        status
    } = data;

    await employee.update({
        full_name: full_name || employee.full_name,
        nik: nik || employee.nik,
        department: department || employee.department,
        position: position || employee.position,
        phone: phone || employee.phone,
        address: address || employee.address,
        hire_date: hire_date || employee.hire_date,
        status: status || employee.status,
        photo: file?.filename || employee.photo
    });

    return {
        employee_id: employee.id,
        full_name: employee.full_name,
        position: employee.position,
        status: employee.status,
        photo_url: employee.photo
            ? `http://localhost:4003/employee-photos/${employee.photo}`
            : null
    };
}

async function terminateEmployee(employeeId, req) {
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
        throw new BaseError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
    }

    if (employee.photo) {
        const photoPath = path.join(__dirname, '../../uploads/employee_photos', employee.photo);
        if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
        }
    }

    await employee.update({
        terminated_at: new Date(),
        status: 'inactive'
    });

    const token = req.headers.authorization;

    try {
        await axios.patch(
            `http://localhost:4002/api/auth/users/${employee.user_id}/active`,
            { is_active: false },
            { headers: { Authorization: token } }
        );
    } catch (error) {
        console.error('Deactivate user failed:', error?.response?.data || error.message);
        throw new BaseError('Employee terminated, but failed to deactivate user', 500, 'USER_DEACTIVATION_FAILED');
    }
}
async function searchEmployees(query) {
    const {
        search,
        nik,
        department,
        status,          
        terminated,       
        page = 1,
        per_page = 10
    } = query;

    const where = {};

    if (search) {
        where.full_name = { [Op.iLike]: `%${search}%` };
    }

    if (nik) {
        where.nik = { [Op.iLike]: `%${nik}%` };
    }

    if (department) {
        where.department = department;
    }

    if (status) {
        where.status = status;
    }

    if (terminated === 'true') {
        where.terminated_at = { [Op.not]: null };
    } else if (terminated === 'false') {
        where.terminated_at = null;
    }

    const offset = (page - 1) * per_page;

    const { rows, count } = await Employee.findAndCountAll({
        where,
        limit: parseInt(per_page),
        offset: parseInt(offset),
        order: [['full_name', 'ASC']]
    });

    return {
        total: count,
        page: parseInt(page),
        per_page: parseInt(per_page),
        data: rows.map(emp => ({
            id: emp.id,
            user_id: emp.user_id,
            full_name: emp.full_name,
            nik: emp.nik,
            department: emp.department,
            position: emp.position,
            status: emp.status,
            phone: emp.phone,
            address: emp.address,
            hire_date: emp.hire_date,
            photo_url: emp.photo
                ? `http://localhost:4003/employee-photos/${emp.photo}`
                : null
        }))
    };
}

module.exports = {
    createEmployeeWithUser,
    getMyProfile,
    getEmployeeById,
    updateMyProfile,
    updateEmployeeById,
    terminateEmployee,
    searchEmployees
};
