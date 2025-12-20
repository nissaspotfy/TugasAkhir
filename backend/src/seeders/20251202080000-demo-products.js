'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', [
      // Indonesia (ID 3f816432-f7b4-4e3a-9c7a-8727276568c1)
      {
        id: uuidv4(),
        name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng kampung dengan topping telur mata sapi dan sate ayam.',
        price: 25000,
        stock: 50,
        weight: 350,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c1',
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sate Ayam Madura',
        description: 'Sate ayam dengan bumbu kacang khas Madura yang kental.',
        price: 30000,
        stock: 40,
        weight: 300,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c1',
        image_url: 'https://images.unsplash.com/photo-1539255627054-94e339678829?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Jepang (ID 3f816432-f7b4-4e3a-9c7a-8727276568c2)
      {
        id: uuidv4(),
        name: 'Sushi Salmon Roll',
        description: 'Sushi roll dengan isian salmon segar dan alpukat.',
        price: 45000,
        stock: 30,
        weight: 200,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c2',
        image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Ramen Ayam',
        description: 'Mie ramen dengan kuah kaldu ayam yang gurih dan topping nori.',
        price: 35000,
        stock: 35,
        weight: 500,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c2',
        image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Korea (ID 3f816432-f7b4-4e3a-9c7a-8727276568c3)
      {
        id: uuidv4(),
        name: 'Tteokbokki Pedas',
        description: 'Kue beras Korea dengan saus gochujang yang pedas manis.',
        price: 28000,
        stock: 45,
        weight: 300,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c3',
        image_url: 'https://images.unsplash.com/photo-1583224964978-2257b960703c?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Kimchi Jjigae',
        description: 'Sup kimchi pedas dengan tahu dan daging sapi.',
        price: 40000,
        stock: 25,
        weight: 400,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c3',
        image_url: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // India (ID 3f816432-f7b4-4e3a-9c7a-8727276568c4)
      {
        id: uuidv4(),
        name: 'Nasi Biryani Ayam',
        description: 'Nasi basmati berbumbu rempah kuat dengan potongan ayam.',
        price: 50000,
        stock: 20,
        weight: 400,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c4',
        image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Roti Canai Kari',
        description: 'Roti canai renyah disajikan dengan kuah kari ayam.',
        price: 22000,
        stock: 60,
        weight: 200,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c4',
        image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('products', null, {});
  }
};