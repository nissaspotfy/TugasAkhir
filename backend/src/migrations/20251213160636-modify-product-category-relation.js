'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Add category_id column
    await queryInterface.addColumn('products', 'category_id', {
      type: Sequelize.UUID,
      allowNull: true, // Allow null initially for migration safety, or set false if we wipe data
      references: {
        model: 'Categories', // Note: Sequelize usually pluralizes table names
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. Remove old category string column
    await queryInterface.removeColumn('products', 'category');
  },

  async down (queryInterface, Sequelize) {
    // 1. Add back category string column
    await queryInterface.addColumn('products', 'category', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Remove category_id column
    await queryInterface.removeColumn('products', 'category_id');
  }
};