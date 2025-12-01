'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.UUID,
      allowNull: true, // Allow null initially for existing users, or false if we default.
      // If we want to enforce it, we might need to handle existing data.
      // For now, let's say allowNull: true or false depending on logic.
      // The model says allowNull: false. But if we have data, this will fail.
      // I'll check if table is empty. If empty, false is fine.
      // But safe bet is false but we need to be careful.
      // Given it's a dev env likely, I'll try allowNull: false.
      references: {
        model: 'Roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'role_id');
  }
};
