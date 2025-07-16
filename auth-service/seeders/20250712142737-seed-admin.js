'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminRoleId = uuidv4();
    const employeeRoleId = uuidv4();
    const HrRoleId = uuidv4();

    // Insert roles
    await queryInterface.bulkInsert('roles', [
      {
        id: adminRoleId,
        name: 'admin',
        permissions: JSON.stringify({
          roles: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'update', 'delete'],
          employees: ['create', 'read', 'update', 'delete'],
          attendance: ['create', 'read', 'update', 'delete'],
          users: ['create', 'read', 'update', 'delete']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: employeeRoleId,
        name: 'employee',
        permissions: JSON.stringify({
          attendance: ['create', 'read'],
          profile: ['read', 'update']
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: HrRoleId,
        name: 'hr',
        permissions: JSON.stringify({
          roles: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'update', 'delete'],
          employees: ['create', 'read', 'update', 'delete'],
          attendance: ['create', 'read', 'update', 'delete'],
          users: ['create', 'read', 'update', 'delete']
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert admin and employee users
    await queryInterface.bulkInsert('users', [
      {
        id: '5a69b836-7e9c-4746-b812-66ed9a22cc9c',
        name: 'Admin',
        email: 'admin@system.com',
        password: await bcrypt.hash('admin123', 10),
        role_id: adminRoleId,
        is_active : true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '9c3a59d0-775d-42d7-9379-0bb90d99429a',
        name: 'Employee',
        email: 'employee@system.com',
        password: await bcrypt.hash('employee123', 10),
        is_active : true,
        role_id: employeeRoleId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'f8e4b2c6-1c4d-4bfa-ae91-27a2d5a14f19',
        name: 'HR_info',
        email: 'hr@system.com',
        password: await bcrypt.hash('hr1234', 10),
        role_id: HrRoleId,
        is_active : true,
        created_at: new Date(),
        updated_at: new Date()
      },
      
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: { [Sequelize.Op.in]: ['admin@system.com', 'employee@system.com','hr@system.com'] }
    }, {});
    await queryInterface.bulkDelete('Roles', {
      name: { [Sequelize.Op.in]: ['admin', 'employee','hr'] }
    }, {});
  }
};