const Scorer = (sequelize, DataTypes) => {
  const Scorer = sequelize.define(
    "Scorer",
    {
      competitionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      season: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      playerId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      playerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      teamName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      goals: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      assists: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      penalties: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      matchesPlayed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      indexes: [{ fields: ["competitionId", "season", "playerId"] }],
    }
  );

  Scorer.associate = (models) => {
    Scorer.belongsTo(models.League, { foreignKey: "competitionId", targetKey: "leagueId" });
    Scorer.belongsTo(models.Team, { foreignKey: "teamId", targetKey: "teamId" });
  };

  return Scorer;
};

export default Scorer;
