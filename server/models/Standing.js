const Standing = (sequelize, DataTypes) => {
  const Standing = sequelize.define(
    "Standing",
    {
      leagueId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      playedGames: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      won: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      draw: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lost: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      goalsFor: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      goalsAgainst: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      goalDifference: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      season: {
        type: DataTypes.STRING,
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
      form: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      indexes: [
        { fields: ["leagueId", "teamId"] },
        { unique: true, fields: ["leagueId", "teamId", "season", "stage", "group"] },
      ],
    }
  );

  Standing.associate = (models) => {
    Standing.belongsTo(models.League, { foreignKey: "leagueId", targetKey: "leagueId" });
    Standing.belongsTo(models.Team, { foreignKey: "teamId", targetKey: "teamId" });
  };

  return Standing;
};

export default Standing;
