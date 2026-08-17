const Match = (sequelize, DataTypes) => {
  const Match = sequelize.define(
    "Match",
    {
      matchId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      leagueId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      season: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      matchday: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      stage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      group: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      homeTeamId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      awayTeamId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      kickoffTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "SCHEDULED",
      },
      winner: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      homeScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      awayScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      halfTimeHome: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      halfTimeAway: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fullTimeHome: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fullTimeAway: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      extraTimeHome: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      extraTimeAway: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      penaltiesHome: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      penaltiesAway: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lastSyncedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      indexes: [{ unique: true, fields: ["matchId"] }],
    }
  );

  Match.associate = (models) => {
    Match.belongsTo(models.League, { foreignKey: "leagueId", targetKey: "leagueId" });
    Match.belongsTo(models.Team, { foreignKey: "homeTeamId", targetKey: "teamId", as: "homeTeam" });
    Match.belongsTo(models.Team, { foreignKey: "awayTeamId", targetKey: "teamId", as: "awayTeam" });
    Match.hasMany(models.Prediction, { foreignKey: "matchId", sourceKey: "matchId", as: "predictions" });
  };

  return Match;
};

export default Match;
