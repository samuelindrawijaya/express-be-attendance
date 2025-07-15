'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Attendance.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_in: {
      type: DataTypes.DATE,
      allowNull: false
    },
    check_out: {
      type: DataTypes.DATE,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('onsite', 'wfh'),
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Attendance',
    tableName: 'Attendances',
    freezeTableName: true,    
    timestamps: true,
    underscored: true
  });

  return Attendance;
};