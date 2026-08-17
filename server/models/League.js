const League = (sequelize, DataTypes) => {
  const League = sequelize.define(
    "League",
    {
      leagueId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      indexes: [{ unique: true, fields: ["leagueId"] }],
    }
  );

  League.associate = (models) => {
    League.hasMany(models.Team, { foreignKey: "leagueId", sourceKey: "leagueId" });
    League.hasMany(models.Match, { foreignKey: "leagueId", sourceKey: "leagueId" });
    League.hasMany(models.Standing, { foreignKey: "leagueId", sourceKey: "leagueId" });
  };

  return League;
};

export default League;
