import jwt from "jsonwebtoken";

const generateAuthToken = (user) => {
  if (!user || !user.id || !user.email || !user.userType) {
    throw new Error("User information missing or invalid");
  }

  return jwt.sign(
    {
      id: user.id,
      userType: user.userType,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      accessExpiration: user.accessExpiration,
      createdAt: user.createdAt,
    },
    process.env.JWT_SECRET || "sangkiplaimportantkey",
    {
      expiresIn: "21d",
    }
  );
};

export default generateAuthToken;
