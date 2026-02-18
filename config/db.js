import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config()

export const db = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    queueLimit:0,
    connectionLimit:10
}).promise()


export const db_local = mysql.createPool({
    host:process.env.LC_HOST,
    user:process.env.LC_USER,
    password:process.env.LC_PASS,
    database:process.env.LC_NAME,
    queueLimit:0,
    connectionLimit:10
}).promise()



