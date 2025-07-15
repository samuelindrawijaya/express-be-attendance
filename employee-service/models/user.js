module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  return User;
};
