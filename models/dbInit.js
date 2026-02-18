import { BaseResponse } from "./BaseModel.js";
import { db_local } from '../config/db.js';
import { DB_QUERIES } from '../config/Database/db_queries.js';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

class ActionResponse {
    constructor(step, status, message) {
        this.step = step;
        this.status = status;
        this.message = message;
    }
}

class ColumnDetail {
    constructor(col) {
        this.name = col.Field;
        this.type = col.Type;
        this.nullable = col.Null;
        this.key = col.Key;
        this.default = col.Default;
        this.extra = col.Extra;
    }
}

class TableSummary {
    constructor(tableName, rowCount, columns) {
        this.tableName = tableName;
        this.rowCount = rowCount;
        this.columns = columns.map(c => new ColumnDetail(c));
    }
}

export class DB_INIT {
    constructor(){
       
        this.database_creation = null;
        this.creation_steps = [];
        this.tables_summary = [];
        this.message = "Database tables initialized successfully.";
        this.status = true;
    }

    static async initialize() {
        const response = new DB_INIT();

        // 1. Create Database
        try {
            const connection = await mysql.createConnection({
                host: process.env.LC_HOST,
                user: process.env.LC_USER,
                password: process.env.LC_PASS
            });
            await connection.query(DB_QUERIES.CREATE_DB);
            await connection.end();
            response.database_creation = new ActionResponse("Database Creation", true, "Database checked/created successfully.");
        } catch (error) {
            response.database_creation = new ActionResponse("Database Creation", false, error.message);
        }

        // 2. Create Tables
        // Dynamically iterate over all keys in QUERIES that start with CREATE_ and end with _TABLE
        const tableKeys = Object.keys(DB_QUERIES).filter(key => key.startsWith('CREATE_') && key.endsWith('_TABLE'));

        for (const key of tableKeys) {
            try {
                await db_local.query(DB_QUERIES[key]);
                response.creation_steps.push(new ActionResponse(key, true, "Table checked/created successfully."));
            } catch (error) {
                response.creation_steps.push(new ActionResponse(key, false, error.message));
            }
        }

        // 3. Seed Admin User
        try {
            await db_local.query(DB_QUERIES.INSERT_ADMIN_ROLE);
            const hashedPassword = await bcrypt.hash('admin', 10);
            await db_local.query(DB_QUERIES.INSERT_ADMIN_USER, [hashedPassword]);
            response.creation_steps.push(new ActionResponse("Seed Admin", true, "Admin user checked/created successfully."));
        } catch (error) {
            response.creation_steps.push(new ActionResponse("Seed Admin", false, error.message));
        }

        // 4. Fetch all tables to show summary
        try {
            const [tables] = await db_local.query("SHOW TABLES");
            const tableList = tables.map((row) => Object.values(row)[0]);

            for (const table of tableList) {
                const [columns] = await db_local.query(`SHOW COLUMNS FROM ${table}`);
                const [countResult] = await db_local.query(`SELECT COUNT(*) as count FROM ${table}`);
                
                response.tables_summary.push(new TableSummary(table, countResult[0].count, columns));
            }
        } catch (error) {
            console.error("Error fetching table summary", error);
        }
        
        return response;
    }
}