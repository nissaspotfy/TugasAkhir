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
        name: 'Seblak',
        description: 'Seblak kuah pedas dengan berbagai aneka topping kerupuk, sosis, dan makaroni.',
        price: 15000,
        stock: 50,
        weight: 300,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c1',
        image_url: 'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Mie Telor',
        description: 'Mie goreng telor khas nusantara yang gurih dan lezat.',
        price: 18000,
        stock: 60,
        weight: 300,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c1',
        image_url: 'https://images.unsplash.com/photo-1612929633738-8fe01f7c8ec2?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Nasi Kepal',
        description: 'Nasi kepal berisi suwiran ayam pedas, praktis dan mengenyangkan.',
        price: 10000,
        stock: 40,
        weight: 200,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c1',
        image_url: 'https://images.unsplash.com/photo-1580828369019-2238b69db7bc?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Pisang Keju',
        description: 'Pisang bakar bertabur keju melimpah dan susu kental manis.',
        price: 12000,
        stock: 30,
        weight: 250,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c1',
        image_url: 'https://images.unsplash.com/photo-1628108422176-000c2ab46261?auto=format&fit=crop&q=80&w=500',
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
        image_url: 'https://images.unsplash.com/photo-1583224964685-2c8b05697bb3?auto=format&fit=crop&q=80&w=500',
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
      {
        id: uuidv4(),
        name: 'Tomyum',
        description: 'Sup asam pedas segar dengan perpaduan rempah dan hidangan laut mini.',
        price: 38000,
        stock: 30,
        weight: 400,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c3',
        image_url: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Rabboki',
        description: 'Perpaduan ramen kenyal dan tteokbokki berbalut saus gochujang autentik.',
        price: 32000,
        stock: 40,
        weight: 350,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c3',
        image_url: 'https://images.unsplash.com/photo-1583224964978-2257b960703c?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Kimbab',
        description: 'Gulungan nasi ala Korea dengan isian sayuran, telur, dan daging yang lezat.',
        price: 25000,
        stock: 35,
        weight: 250,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c3',
        image_url: 'https://images.unsplash.com/photo-1647414844621-66defdc566d2?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // India (ID 3f816432-f7b4-4e3a-9c7a-8727276568c4)
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
      },
      {
        id: uuidv4(),
        name: 'Roti Maryam',
        description: 'Roti maryam hangat yang bertekstur lembut dan berserat.',
        price: 15000,
        stock: 60,
        weight: 150,
        category_id: '3f816432-f7b4-4e3a-9c7a-8727276568c4',
        image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=500',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('products', null, {});
  }
};