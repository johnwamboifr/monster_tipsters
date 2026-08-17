const Season = (sequelize, DataTypes) => {
  const Season = sequelize.define(
    "Season",
    {
      leagueId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      season: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      currentMatchday: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      winner: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isCurrent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [{ fields: ["leagueId", "season"] }],
    }
  );

  Season.associate = (models) => {
    Season.belongsTo(models.League, { foreignKey: "leagueId", targetKey: "leagueId" });
  };

  return Season;
};

export default Season;
