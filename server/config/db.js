import dotenv from "dotenv";

dotenv.config();

const config = {
  development: {
    username: process.env.DB_USERNAME || "sql12835302",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "sql12835302",
    host: process.env.DB_HOST || "sql12.freesqldatabase.com",
    dialect: "mysql",
    port: Number(process.env.DB_PORT || 3306),
  },

  production: {
    username: process.env.DB_USERNAME || "sql12835302",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "sql12835302",
    host: process.env.DB_HOST || "sql12.freesqldatabase.com",
    dialect: "mysql",
    port: Number(process.env.DB_PORT || 3306),
  },

  test: {
    username: process.env.DB_USERNAME || "sql12835302",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "sql12835302",
    host: process.env.DB_HOST || "sql12.freesqldatabase.com",
    dialect: "mysql",
    port: Number(process.env.DB_PORT || 3306),
  },
};

export default config;
