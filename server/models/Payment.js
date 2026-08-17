const Payments = (sequelize, DataTypes) => {
  const Payments = sequelize.define("Payments", {
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    checkoutRequestId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mpesaReceiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    planId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    network: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    screenshotUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rejectionReason: {
  type: DataTypes.ENUM(
    "WRONG_AMOUNT",
    "WRONG_NETWORK",
    "INVALID_TRANSACTION",
    "SCREENSHOT_UNCLEAR",
    "SCREENSHOT_INVALID",
    "PAYMENT_NOT_FOUND",
    "DUPLICATE_PAYMENT",
    "PAYMENT_ALREADY_USED",
    "OTHER"
  ),
  allowNull: true,
},
    
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    callbackPayload: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  });

  Payments.associate = (models) => {
    Payments.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
    Payments.belongsTo(models.Users, {
      foreignKey: "reviewedBy",
      as: "reviewer",
      onDelete: "SET NULL",
    });
  };

  return Payments;
};

export default Payments;
