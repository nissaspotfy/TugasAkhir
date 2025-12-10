'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.user, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Transaction.hasMany(models.TransactionItem, {
        foreignKey: 'transaction_id',
        as: 'items'
      });
      Transaction.belongsTo(models.Promo, {
        foreignKey: 'promo_id',
        as: 'promo'
      });
    }
  }
  Transaction.init({
    user_id: DataTypes.UUID,
    total_amount: DataTypes.INTEGER,
    status: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled'),
    snap_token: DataTypes.STRING,
    promo_id: DataTypes.INTEGER,
    discount_amount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions'
  });
  return Transaction;
};
