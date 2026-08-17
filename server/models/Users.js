const Users = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verificationCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verificationCodeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userType: {
      type: DataTypes.ENUM("admin", "client", "vip"),
      allowNull: false,
      defaultValue: "client",
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginIp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLoginUserAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Users.associate = (models) => {
    Users.hasMany(models.Payments, {
      foreignKey: "userId",
      as: "payments",
      onDelete: "CASCADE",
    });
    Users.hasMany(models.Prediction, {
      foreignKey: "createdBy",
      as: "createdPredictions",
      onDelete: "SET NULL",
    });
    Users.hasMany(models.Prediction, {
      foreignKey: "updatedBy",
      as: "updatedPredictions",
      onDelete: "SET NULL",
    });
  };

  return Users;
};

export default Users;
