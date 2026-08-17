const Prediction = (sequelize, DataTypes) => {
  const Prediction = sequelize.define(
    "Prediction",
    {
      matchId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prediction: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      market: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      odds: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      analysis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tipsType: {
        type: DataTypes.ENUM("free", "bronze", "silver", "gold"),
        allowNull: false,
        defaultValue: "free",
      },
      result: {
        type: DataTypes.ENUM("pending", "won", "lost", "void"),
        allowNull: false,
        defaultValue: "pending",
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ["matchId", "market", "prediction"] }],
    }
  );

  Prediction.associate = (models) => {
    Prediction.belongsTo(models.Match, { foreignKey: "matchId", targetKey: "matchId", as: "match" });
    Prediction.belongsTo(models.Users, { foreignKey: "createdBy", targetKey: "id", as: "createdByUser" });
    Prediction.belongsTo(models.Users, { foreignKey: "updatedBy", targetKey: "id", as: "updatedByUser" });
  };

  return Prediction;
};

export default Prediction;
