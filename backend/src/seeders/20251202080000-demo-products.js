'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', [
      {
        name: 'Keripik Pisang Manis',
        description: 'Keripik pisang renyah dengan balutan gula asli yang manis legit.',
        price: 15000,
        stock: 100,
        category: 'Manis',
        image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Basreng Pedas Level 5',
        description: 'Bakso goreng super pedas dengan bumbu rempah rahasia.',
        price: 12000,
        stock: 50,
        category: 'Pedas',
        image_url: 'https://images.unsplash.com/photo-1621451537084-482c73071a06?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Makaroni Keju Spesial',
        description: 'Makaroni spiral dengan taburan keju cheddar melimpah.',
        price: 10000,
        stock: 75,
        category: 'Asin',
        image_url: 'https://images.unsplash.com/photo-1566497014629-4f4b58f2b140?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sale Pisang Basah',
        description: 'Sale pisang khas Sukabumi yang legit dan manis alami.',
        price: 18000,
        stock: 30,
        category: 'Manis',
        image_url: 'https://images.unsplash.com/photo-1600626337889-1045b4832d83?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kerupuk Seblak Kering',
        description: 'Kerupuk dengan bumbu kencur yang khas dan pedas nampol.',
        price: 8000,
        stock: 200,
        category: 'Pedas',
        image_url: 'https://images.unsplash.com/photo-1566497014629-4f4b58f2b140?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cireng Rujak Beku',
        description: 'Cireng siap goreng lengkap dengan bumbu rujak asam manis pedas.',
        price: 20000,
        stock: 40,
        category: 'Asin',
        image_url: 'https://images.unsplash.com/photo-1621451537084-482c73071a06?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('products', null, {});
  }
};
