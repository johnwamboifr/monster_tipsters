const Images = (sequelize, DataTypes) => {
  const Images = sequelize.define("Images", {
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Images;
};

export default Images;
