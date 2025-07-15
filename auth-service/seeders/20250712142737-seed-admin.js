'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminRoleId = uuidv4();
    const employeeRoleId = uuidv4();
    const HrRoleId = uuidv4();

    const adminUserId = uuidv4();
    const employeeUserId = uuidv4();
    const HrUserId = uuidv4();  

    // Insert roles
    await queryInterface.bulkInsert('roles', [
      {
        id: adminRoleId,
        name: 'admin',
        permissions: JSON.stringify({
          roles: ['create', 'read', 'update', 'delete'],
          reports: ['create', 'read', 'update', 'delete'],
          employees: ['create', 'read', 'update', 'delete'],
          attendance: ['create', 'read', 'update', 'delete']
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
          employees: ['create', 'read','update', 'delete'],
          attendance: ['read'],
          reports: ['read']
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert admin and employee users
    await queryInterface.bulkInsert('users', [
      {
        id: adminUserId,
        name: 'Admin',
        email: 'admin@system.com',
        password: await bcrypt.hash('admin123', 10),
        role_id: adminRoleId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: employeeUserId,
        name: 'Employee',
        email: 'employee@system.com',
        password: await bcrypt.hash('employee123', 10),
        role_id: employeeRoleId,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: HrUserId,
        name: 'HR_info',
        email: 'hr@system.com',
        password: await bcrypt.hash('hr1234', 10),
        role_id: HrRoleId,
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
