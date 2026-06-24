'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      // define association here
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
      Transaction.belongsTo(models.Address, {
        foreignKey: 'shipping_address_id',
        as: 'shippingAddress'
      });
      Transaction.hasOne(models.review, {
        foreignKey: 'transaction_id',
        as: 'review'
      });
    }
  }
  Transaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: DataTypes.UUID,
    total_amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shipping_cost: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    shipping_address_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    shipping_provider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shipping_service: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'processing', 'success', 'failed', 'cancelled'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions'
  });
  return Transaction;
};
