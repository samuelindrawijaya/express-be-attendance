'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.hasMany(models.User, { foreignKey: 'role_id' });
    }
  }
  Role.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    permissions: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',         // 👈 WAJIB kecil
    freezeTableName: true,      // 👈 biar gak jadi "Roles"
    timestamps: true,
    underscored: true
  });
  return Role;
};