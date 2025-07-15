'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      permissions: {
        type: Sequelize.JSONB,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  }
};