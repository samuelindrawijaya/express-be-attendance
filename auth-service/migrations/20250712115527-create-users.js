'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING
      },
      role_id: {
        type: Sequelize.UUID,
        references: {
          model: 'roles',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      is_active: Sequelize.BOOLEAN,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
