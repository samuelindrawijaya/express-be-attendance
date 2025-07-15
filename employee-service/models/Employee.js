'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Employee extends Model {
        static associate(models) {
            Employee.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    Employee.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nik: {
            type: DataTypes.STRING,
            unique: true
        },
        department: DataTypes.STRING,
        position: DataTypes.STRING,
        phone: DataTypes.STRING,
        photo: DataTypes.STRING,
        address: DataTypes.TEXT,
        hire_date: DataTypes.DATE,
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        terminated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Employee',
        tableName: 'employees',
        timestamps: true,
        underscored: true
    });

    return Employee;
};
