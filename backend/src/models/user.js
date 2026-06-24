'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.profile, {
        foreignKey: 'user_id',
        as: 'profiles',
      });
      user.belongsTo(models.role, {
        foreignKey: 'role_id',
        as: 'role',
      });
      user.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions'
      });
      user.hasMany(models.Address, {
        foreignKey: 'user_id',
        as: 'addresses'
      });
      user.hasMany(models.review, {
        foreignKey: 'user_id',
        as: 'reviews'
      });
      user.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications'
      });
    }
  }
  user.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id'
      }
    },
    reset_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};