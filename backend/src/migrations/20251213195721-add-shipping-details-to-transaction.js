'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'shipping_provider', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'shipping_service', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'shipping_provider');
    await queryInterface.removeColumn('transactions', 'shipping_service');
  }
};