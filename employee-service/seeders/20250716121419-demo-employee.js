'use strict';
const { v4: uuidv4 } = require('uuid');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('employees', [
      {
        id: uuidv4(),
        user_id: '9c3a59d0-775d-42d7-9379-0bb90d99429a',
        full_name: 'Employee Demo',
        nik: 'EMP001',
        department: 'Operations',
        position: 'Staff',
        phone: '081234567892',
        photo: null,
        address: 'Jl. Pegawai No.2',
        hire_date: new Date(),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', {
      nik: { [Sequelize.Op.in]: ['ADM001', 'EMP001', 'HR001'] }
    }, {});
  }
};
