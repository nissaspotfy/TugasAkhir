'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'shipping_cost', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('transactions', 'shipping_address_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'shipping_cost');
    await queryInterface.removeColumn('transactions', 'shipping_address_id');
  }
};