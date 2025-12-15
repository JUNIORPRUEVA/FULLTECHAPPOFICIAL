require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
};

if (!env.DATABASE_URL) throw new Error("Falta DATABASE_URL en .env");
if (!env.JWT_SECRET) throw new Error("Falta JWT_SECRET en .env");

module.exports = { env };
