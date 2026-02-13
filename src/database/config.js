require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'root',
        password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'root',
        database: process.env.DB_DATABASE || process.env.POSTGRES_DB || 'ceos',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
    },
    production: {
        username: process.env.DB_USERNAME || process.env.POSTGRES_USER,
        password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
        database: process.env.DB_DATABASE || process.env.POSTGRES_DB,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
    }
};
