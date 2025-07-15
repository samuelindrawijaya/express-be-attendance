'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      action: Sequelize.STRING,
      table_name: Sequelize.STRING,
      record_id: Sequelize.UUID,
      old_values: Sequelize.JSONB,
      new_values: Sequelize.JSONB,
      ip_address: Sequelize.STRING,
      user_agent: Sequelize.TEXT,
      actor_type: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  }
};