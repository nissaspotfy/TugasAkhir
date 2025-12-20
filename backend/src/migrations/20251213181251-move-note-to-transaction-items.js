'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Add note to TransactionItems
    await queryInterface.addColumn('transaction_items', 'note', {
      type: Sequelize.STRING, // Use STRING for shorter notes or TEXT for longer
      allowNull: true
    });

    // 2. Remove note from Transactions
    await queryInterface.removeColumn('transactions', 'note');
  },

  async down (queryInterface, Sequelize) {
    // 1. Add note back to Transactions
    await queryInterface.addColumn('transactions', 'note', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // 2. Remove note from TransactionItems
    await queryInterface.removeColumn('transaction_items', 'note');
  }
};