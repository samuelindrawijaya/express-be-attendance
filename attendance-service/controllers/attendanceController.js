const { clockInAttendance, clockOutAttendance, getMyAttendance, getTodayAttendance
    , getMyAttendanceStats, getAllAttendance, getAttendanceById, getAllAttendanceStats
} = require('../services/attendanceService');
const { createResponse } = require('../../shared/utils/response');
const fs = require('fs');
const path = require('path');

const checkInController = async (req, res) => {
    try {
        console.log(req.body);
        const result = await clockInAttendance(req.body, req.file, req.user);

        return res.status(201).json(
            createResponse(true, 'Check-in successful', result)
        );
    } catch (error) {
        console.error('Check-in error:', error);

        // Hapus foto jika gagal
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'CHECKIN_FAILED')
        );
    }
};

const clockOutController = async (req, res) => {
    try {
        const { employee_id } = req.body;

        if (!employee_id) {
            return res.status(400).json(
                createResponse(false, 'employee_id is required', null, 'VALIDATION_ERROR')
            );
        }

        const result = await clockOutAttendance(employee_id, req.user.id);

        return res.status(200).json(
            createResponse(true, 'Clock-out successful', result)
        );
    } catch (error) {
        console.error('Clock-out error:', error);

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'CLOCKOUT_FAILED')
        );
    }
};
const getMyAttendanceController = async (req, res) => {
    try {
        const { start, end } = req.query;
        const result = await getMyAttendance(start, end, req.user.id);

        return res.status(200).json(
            createResponse(true, 'Attendance history fetched', result)
        );
    } catch (error) {
        console.error('GetMyAttendance error:', error);
        return res.status(500).json(
            createResponse(false, 'Failed to fetch attendance history', null, 'GET_MY_ATTENDANCE_FAILED')
        );
    }
};
const getTodayAttendanceController = async (req, res) => {
    try {
        const result = await getTodayAttendance(req.user.id);

        return res.status(200).json(
            createResponse(true, 'Today attendance fetched', result || null)
        );
    } catch (error) {
        console.error('GetTodayAttendance error:', error);
        return res.status(500).json(
            createResponse(false, 'Failed to get today attendance', null, 'GET_TODAY_ATTENDANCE_FAILED')
        );
    }
};

const getAllAttendanceController = async (req, res) => {
    try {
        const { start, end, employee_id } = req.query;

        const result = await getAllAttendance(
            { startDate: start, endDate: end, employee_id },
            req.headers.authorization // token buat axios ke employee-service
        );

        return res.status(200).json(
            createResponse(true, 'Attendance records fetched', result)
        );
    } catch (error) {
        console.error('GetAllAttendance error:', error);

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'GET_ATTENDANCE_FAILED')
        );
    }
};
const getAllAttendanceStatsController = async (req, res) => {
    try {
        const result = await getAllAttendanceStats();

        return res.status(200).json(
            createResponse(true, 'Global attendance stats fetched', result)
        );
    } catch (error) {
        console.error('GetAllAttendanceStats error:', error);
        return res.status(500).json(
            createResponse(false, 'Failed to get global stats', null, 'GET_GLOBAL_STATS_FAILED')
        );
    }
};
const getMyAttendanceStatsController = async (req, res) => {
    try {
        const result = await getMyAttendanceStats(req.user.id);

        return res.status(200).json(
            createResponse(true, 'Attendance stats fetched', result)
        );
    } catch (error) {
        console.error('GetStats error:', error);

        return res.status(500).json(
            createResponse(false, 'Failed to get stats', null, 'GET_STATS_FAILED')
        );
    }
};

const getAttendanceByIdController = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await getAttendanceById(id, req.headers.authorization);

        return res.status(200).json(
            createResponse(true, 'Attendance detail fetched', result)
        );
    } catch (error) {
        console.error('GetAttendanceById error:', error);

        return res.status(error.statusCode || 500).json(
            createResponse(false, error.message, null, error.code || 'GET_ATTENDANCE_BY_ID_FAILED')
        );
    }
};


module.exports = {
    checkInController,
    clockOutController,
    getMyAttendanceController,
    getTodayAttendanceController,
    getMyAttendanceStatsController,
    getAllAttendanceController,
    getAttendanceByIdController,
    getAllAttendanceStatsController,
};
