import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 4000, // Fast 4s timeout if remote DB is unresponsive
    queueLimit: 0,
    connectionLimit: 10
}).promise();

export const db_local = mysql.createPool({
    host: process.env.DB_LOCAL_HOST || '127.0.0.1',
    user: process.env.DB_LOCAL_USER || process.env.DB_USER,
    password: process.env.DB_LOCAL_PASS || process.env.DB_PASS,
    database: process.env.DB_LOCAL_NAME || process.env.DB_NAME,
    connectTimeout: 4000,
    queueLimit: 0,
    connectionLimit: 10
}).promise();
