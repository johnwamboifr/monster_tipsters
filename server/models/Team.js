const Team = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    "Team",
    {
      teamId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      leagueId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shortName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tla: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      venue: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      founded: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      indexes: [{ unique: true, fields: ["teamId"] }],
    }
  );

  Team.associate = (models) => {
    Team.belongsTo(models.League, { foreignKey: "leagueId", targetKey: "leagueId" });
    Team.hasMany(models.Match, { foreignKey: "homeTeamId", sourceKey: "teamId", as: "homeMatches" });
    Team.hasMany(models.Match, { foreignKey: "awayTeamId", sourceKey: "teamId", as: "awayMatches" });
  };

  return Team;
};

export default Team;
