'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promo extends Model {
    static associate(models) {
      Promo.hasMany(models.Transaction, {
        foreignKey: 'promo_id',
        as: 'transactions'
      });
    }
  }
  Promo.init({
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    max_usage: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Promo',
    tableName: 'promos'
  });
  return Promo;
};
