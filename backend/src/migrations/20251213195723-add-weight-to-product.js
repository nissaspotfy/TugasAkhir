'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'weight', {
      type: Sequelize.INTEGER, // in grams
      defaultValue: 100, // Default 100g
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'weight');
  }
};