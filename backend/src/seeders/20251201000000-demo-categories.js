'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      {
        id: '3f816432-f7b4-4e3a-9c7a-8727276568c1',
        name: 'Indonesia',
        slug: 'indonesia',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3f816432-f7b4-4e3a-9c7a-8727276568c2',
        name: 'Jepang',
        slug: 'jepang',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3f816432-f7b4-4e3a-9c7a-8727276568c3',
        name: 'Korea',
        slug: 'korea',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3f816432-f7b4-4e3a-9c7a-8727276568c4',
        name: 'India',
        slug: 'india',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
