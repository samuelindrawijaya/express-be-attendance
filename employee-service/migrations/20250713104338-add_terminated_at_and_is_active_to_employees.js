'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'terminated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('employees', 'terminated_at');
    }
};
