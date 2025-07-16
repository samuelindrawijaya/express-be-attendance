'use strict';
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Attendances', [
            {
                id: uuidv4(),
                user_id: '9c3a59d0-775d-42d7-9379-0bb90d99429a',
                employee_id: 'a5afb202-9c04-4f1a-acb2-7487beaad10b',
                date: '2025-07-13',
                check_in: new Date('2025-07-13T08:00:00'),
                check_out: new Date('2025-07-13T17:00:00'),
                type: 'onsite',
                photo: 'attendance_photos/employee_20250716.jpg',
                notes: 'Onsite as scheduled',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                user_id: '9c3a59d0-775d-42d7-9379-0bb90d99429a',
                employee_id: 'a5afb202-9c04-4f1a-acb2-7487beaad10b',
                date: '2025-07-14',
                check_in: new Date('2025-07-14T08:30:00'),
                check_out: new Date('2025-07-14T16:30:00'),
                type: 'wfh',
                photo: 'attendance_photos/hr_20250716.jpg',
                notes: 'Work from home due to rain',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                user_id: '9c3a59d0-775d-42d7-9379-0bb90d99429a',
                employee_id: 'a5afb202-9c04-4f1a-acb2-7487beaad10b',
                date: '2025-07-17',
                check_in: new Date('2025-07-17T07:45:00'),
                check_out: new Date('2025-07-17T16:30:00'),
                type: 'onsite',
                photo: null,
                notes: 'Meeting with vendor',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Attendances', {
            date: '2025-07-16'
        }, {});
    }
};
