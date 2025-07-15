'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    table_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    record_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    actor_type: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    freezeTableName: true,
    timestamps: true,
    underscored: true
  });

  return AuditLog;
};
