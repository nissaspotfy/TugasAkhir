'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('users', [
      {
        id: '3f816432-f7b4-4e3a-9c7a-8727276568d3',
        name: 'Demo User',
        email: 'user@example.com',
        password: hashedPassword,
        role_id: '2f816432-f7b4-4e3a-9c7a-8727276568d2', // User Role
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    await queryInterface.bulkInsert('Addresses', [
      {
        id: '4f816432-f7b4-4e3a-9c7a-8727276568d4',
        user_id: '3f816432-f7b4-4e3a-9c7a-8727276568d3',
        recipient_name: 'Demo User',
        phone_number: '081234567890',
        address_line: 'Jalan Raya Cibaduyut',
        city: 'Bandung',
        postal_code: '40221',
        latitude: -6.944200,
        longitude: 107.595500,
        is_primary: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Addresses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
