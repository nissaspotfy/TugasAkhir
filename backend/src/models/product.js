'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.TransactionItem, {
        foreignKey: 'product_id',
        as: 'transactionItems'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    category: DataTypes.STRING,
    image_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    paranoid: true // for soft deletes (deletedAt)
  });
  return Product;
};
