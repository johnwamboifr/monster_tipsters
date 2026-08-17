const Codes = (sequelize, DataTypes) => {
  const Codes = sequelize.define("Codes", {
    codeType: {
      type: DataTypes.ENUM("1xbet", "secretbet", "afropari"),
      allowNull: false,
    },
    results: {
      type: DataTypes.ENUM("win", "loss", "pending"),
      allowNull: true,
      defaultValue: "pending",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Codes;
};

export default Codes;
