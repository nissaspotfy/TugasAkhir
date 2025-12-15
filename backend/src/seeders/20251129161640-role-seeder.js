'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        id: '1f816432-f7b4-4e3a-9c7a-8727276568d1', // Admin
        nama_role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2f816432-f7b4-4e3a-9c7a-8727276568d2', // Customer/User
        nama_role: 'User', // Renaming to Customer for clarity
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};