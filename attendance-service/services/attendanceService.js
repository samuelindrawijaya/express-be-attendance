const { Attendance } = require('../models');
const BaseError = require('../../shared/utils/errors/BaseError');
const { Op } = require('sequelize');
const axios = require('axios');
async function clockInAttendance(data, file, user) {
    const { employee_id, type, notes } = data;

    if (!employee_id || !type || !file) {
        throw new BaseError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    const today = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findOne({
        where: {
            employee_id,
            date: today
        }
    });

    if (existing) {
        throw new BaseError('Already checked in today', 409, 'ALREADY_CHECKED_IN');
    }

    const attendance = await Attendance.create({
        user_id: user.id,
        employee_id,
        date: today,
        check_in: new Date(),
        type,
        photo: file.filename,
        notes: notes || null
    });

    return {
        attendance_id: attendance.id,
        employee_id,
        date: today,
        type,
        check_in: attendance.check_in
    };
}

async function clockOutAttendance(employee_id, user_id) {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
        where: {
            employee_id,
            user_id,
            date: today
        }
    });

    if (!attendance) {
        throw new BaseError('No check-in record found for today', 404, 'ATTENDANCE_NOT_FOUND');
    }

    if (attendance.check_out) {
        throw new BaseError('Already checked out today', 409, 'ALREADY_CHECKED_OUT');
    }

    attendance.check_out = new Date();
    await attendance.save();

    return {
        attendance_id: attendance.id,
        check_out: attendance.check_out
    };
}

async function getMyAttendance(startDate, endDate, user_id) {
    const whereClause = { user_id };

    if (startDate && endDate) {
        whereClause.date = {
            [Op.between]: [startDate, endDate]
        };
    }

    const records = await Attendance.findAll({
        where: whereClause,
        order: [['date', 'DESC']]
    });

    const result = records.map(record => {
        const checkIn = new Date(record.check_in);
        const totalMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();

        return {
            ...record.toJSON(),
            is_on_time: totalMinutes < 510, // < 08:30
            photo_url: record.photo
                ? `http://localhost:4004/attendance-photos/${record.photo}`
                : null
        };
    });

    return result;
}
async function getTodayAttendance(user_id) {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
        where: { user_id, date: today },
        attributes: ['user_id', 'date', 'type', 'check_in', 'check_out', 'photo']
    });

    if (!attendance) return null;

    const result = attendance.toJSON();

    result.photo_url = attendance.photo
        ? `http://localhost:4004/attendance-photos/${attendance.photo}`
        : null;

    return result;
}

async function getMyAttendanceStats(user_id) {
    const attendances = await Attendance.findAll({
        where: { user_id }
    });

    const stats = {
        total_days: attendances.length,
        total_wfh: 0,
        total_onsite: 0,
        on_time: 0,
        late: 0
    };

    attendances.forEach(record => {
        if (record.type === 'wfh') stats.total_wfh++;
        if (record.type === 'onsite') stats.total_onsite++;

        const hour = new Date(record.check_in).getHours();
        const minute = new Date(record.check_in).getMinutes();
        const totalMinutes = hour * 60 + minute;

        if (totalMinutes <= 510) { // <= 08:30
            stats.on_time++;
        } else {
            stats.late++;
        }
    });

    return stats;
}


async function getAllAttendance({ startDate, endDate, employee_id }, token) {
    const whereClause = {};

    if (startDate && endDate) {
        whereClause.date = {
            [Op.between]: [startDate, endDate]
        };
    }

    if (employee_id) {
        whereClause.employee_id = employee_id;
    }

    const records = await Attendance.findAll({
        where: whereClause,
        order: [['date', 'DESC']]
    });
    console.log('=== ATTENDANCE SERVICE DEBUG ===');
    if (records.length === 0) return [];

    // Extract unique employee_ids
    const user_id = [...new Set(records.map(r => r.user_id))];

    try {
        console.log('Fetching employee data for IDs:', user_id);
        // Call employee-service
        const empRes = await axios.get(`http://localhost:4003/api/employee/bulk`, {
            headers: { Authorization: token },
            params: { ids: user_id },
            paramsSerializer: {
                indexes: null // This will serialize arrays as ?ids=1&ids=2 instead of ?ids[]=1&ids[]=2
            }
        });

        console.log('Employee service response:', empRes.data); // Debug log

        const employeeMap = {};
        console.log('Creating employee map...');
        console.log(empRes.data); // Debug log
        // Create a map for quick lookup
        empRes.data.data.forEach(emp => {
            console.log('Mapping employee:', emp.id, emp.full_name); // Debug log
            employeeMap[emp.id] = emp;
        });
        console.log('Employee map created:', employeeMap); // Debug log
        // Merge attendance with employee
        const result = records.map(att => {
            const checkIn = new Date(att.check_in);
            const totalMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();

            return {
                ...att.toJSON(),
                photo_url: att.photo
                    ? `http://localhost:4004/attendance-photos/${att.photo}`
                    : null,
                is_on_time: totalMinutes < 510,
                employee: employeeMap[att.employee_id] || null
            };
        });

        return result;
    } catch (error) {
        console.error('Axios error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                params: error.config?.params
            }
        });
        throw error;
    }
}

async function getAttendanceById(id, token) {
    const record = await Attendance.findByPk(id);

    if (!record) {
        throw new BaseError('Attendance not found', 404, 'ATTENDANCE_NOT_FOUND');
    }

    let employee = null;

    try {
        const res = await axios.get(
            `http://localhost:4003/api/employee/${record.employee_id}`,
            {
                headers: { Authorization: token }
            }
        );
        employee = res.data.data;
    } catch (err) {
        console.warn('Failed to fetch employee:', err?.response?.data?.message || err.message);
    }

    const checkIn = new Date(record.check_in);
    const totalMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();

    return {
        ...record.toJSON(),
        photo_url: record.photo
            ? `http://localhost:4004/attendance-photos/${record.photo}`
            : null,
        is_on_time: totalMinutes < 510,
        employee
    };
}

async function getAllAttendanceStats() {
    const attendances = await Attendance.findAll();

    const uniqueMap = new Map();

    attendances.forEach(record => {
        const key = `${record.user_id}_${record.date}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, record); 
        }
    });

    const stats = {
        total_days: uniqueMap.size,
        total_wfh: 0,
        total_onsite: 0,
        on_time: 0,
        late: 0
    };
    
    for (const record of uniqueMap.values()) {
        if (record.type === 'wfh') stats.total_wfh++;
        if (record.type === 'onsite') stats.total_onsite++;

        const checkIn = new Date(record.check_in);
        const totalMinutes = checkIn.getHours() * 60 + checkIn.getMinutes();

        if (totalMinutes <= 510) {
            stats.on_time++;
        } else {
            stats.late++;
        }
    }

    return stats;
}




module.exports = {
    clockInAttendance,
    clockOutAttendance,
    getMyAttendance,
    getTodayAttendance,
    getMyAttendanceStats,
    getAllAttendance,
    getAttendanceById,
    getAllAttendanceStats
};
