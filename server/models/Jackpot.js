const Jackpots = (sequelize, DataTypes) => {
  const Jackpots = sequelize.define("Jackpots", {
    jackpotType: {
      type: DataTypes.ENUM(
        "odibets",
        "sportpesaMid",
        "sportpesaMega",
        "mozzart",
        "betikaMid",
        "betikaMega"
      ),
      allowNull: false,
    },
    prediction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    results: {
      type: DataTypes.ENUM("win", "loss", "pending"),
      allowNull: true,
      defaultValue: "pending",
    },
    match: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Jackpots;
};

export default Jackpots;
