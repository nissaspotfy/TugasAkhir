const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const isAiven = Boolean(
  (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com')) ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('aivencloud.com'))
);

const requireSSL = process.env.DB_SSL === 'true' || isAiven;

const sslConfig = requireSSL ? {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
} : {};

const dbConfig = {
  username: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGS === 'true' ? console.log : false,
  timezone: process.env.DB_TIMEZONE || '+07:00',
  ...sslConfig
};

module.exports = {
  development: {
    ...dbConfig
  },
  test: {
    ...dbConfig
  },
  production: {
    ...dbConfig
  },
};