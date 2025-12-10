'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionItem extends Model {
    static associate(models) {
      TransactionItem.belongsTo(models.Transaction, {
        foreignKey: 'transaction_id',
        as: 'transaction'
      });
      TransactionItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }
  TransactionItem.init({
    transaction_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price_at_time: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'TransactionItem',
    tableName: 'transaction_items'
  });
  return TransactionItem;
};
