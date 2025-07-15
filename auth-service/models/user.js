'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'role_id' });
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id' });
      User.hasMany(models.AuditLog, { foreignKey: 'user_id' });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // ✅ penting!
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',         // <= ini penting
    freezeTableName: true,      // supaya gak dijadiin jamak otomatis
    timestamps: true,
    underscored: true
  });
  return User;
};