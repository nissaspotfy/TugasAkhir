'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('promos', [
      {
        code: 'DISKON10',
        discount_type: 'percentage',
        discount_value: 10, // 10%
        is_active: true,
        max_usage: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'HEMAT5000',
        discount_type: 'fixed',
        discount_value: 5000, // Rp 5000
        is_active: true,
        max_usage: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MERDEKA',
        discount_type: 'percentage',
        discount_value: 17, // 17%
        is_active: true,
        max_usage: 17,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('promos', null, {});
  }
};
