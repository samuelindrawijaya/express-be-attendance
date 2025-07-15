'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  RefreshToken.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: DataTypes.UUID,
    token: DataTypes.TEXT,
    expires_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    freezeTableName: true,
    timestamps: true,
    underscored: true
  });

  return RefreshToken;
};
