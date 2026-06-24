'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // In MySQL, we change the column structure to allow ENUM values for 'processing' and 'success'
    await queryInterface.changeColumn('transactions', 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'processing', 'success', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert column structure back to the original ENUM list
    await queryInterface.changeColumn('transactions', 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};
