'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
      Product.hasMany(models.TransactionItem, {
        foreignKey: 'product_id',
        as: 'transactionItems'
      });
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
    }
  }
  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    weight: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    category_id: DataTypes.UUID, // Changed from category string
    image_url: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'aktif',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    paranoid: true // for soft deletes (deletedAt)
  });
  return Product;
};
