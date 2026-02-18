import {db,db_local} from '../config/db.js'
import { BaseResponse } from "../models/BaseModel.js";
import { Products } from "../models/ProductsModel.js";
import fs from 'fs';
import {AbortController }  from 'node-abort-controller';


async function saveFile(fileContent, ) {
  try {
    // Write the content to the file, creating it if it doesn't exist or overwriting if it does
    const filePath = "query"+new Date().getTime()+".sql";
    await fs.promises.writeFile(filePath, fileContent, 'utf8');
    console.log(`Successfully saved file to ${filePath}`);
  } catch (error) {
    console.error('Error saving file:', error);
  }
}
export const getProductsDetails = async (req, res) => {
    const oBaseResponse = new BaseResponse();

    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10; // Default limit 10 is better than 1
        const offset = (page - 1) * limit;
        const sortColumn = req.query.sort || "itemcode"; // Default sort by ID
        const sortOrder = req.query.order || "ASC"; // Default A-Z

        const allowedColumns = ["itemcode", "groupname", "title", "date_first_added"];
        const safeColumn = allowedColumns.includes(sortColumn) ? sortColumn : "ID";
        const safeOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

        // 1. Get the Search Term (defaults to empty string if not provided)
        const searchTerm = req.query.search || ""; 

        // 2. Build the SQL Query
        // We add "WHERE city.Name LIKE ?" to filter results
        // We use % wildcard so "Lon" finds "London"
        const sql = `
            select * from products 
            WHERE itemcode LIKE ? 
            ORDER BY ${safeColumn} ${safeOrder}  
            LIMIT ? OFFSET ?
        `;

        // 3. Prepare Parameters
        // The order matches the ? marks: Search Term -> Limit -> Offset
        const searchPattern = searchTerm ? `%${searchTerm}%` : '%%';
        
        console.log("Searching for:", searchPattern);

        const [rows] = await db.query(sql, [searchPattern, limit, offset]);

        // 4. Get Total Count (Must also be filtered!)
        // If searching for "New", we count only "New York", "New Delhi", etc., not ALL cities
        const countSql = `
            SELECT COUNT(*) as total 
            FROM products 
            WHERE itemcode LIKE ?
        `;
        const [countResult] = await db.query(countSql, [searchPattern]);
       

        oBaseResponse.success.message = "Success";
        oBaseResponse.success.status = true;
        oBaseResponse.success.data = {
            rows: rows,
            meta: {
                page: page,
                limit: limit,
                total: countResult.total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        };

        res.status(200).json(oBaseResponse);

    } catch (error) {
        console.error(error);
        oBaseResponse.error.message = error.message;
        oBaseResponse.error.status = true;
        oBaseResponse.error.code = 500;
        res.status(500).json(oBaseResponse);
    }
};


export const runQuery = async (req, res) => {
    console.log("Query Run Initiated")
    const { sql } = req.body;

    // 1. Create the AbortController
    const controller = new AbortController();
    const { signal } = controller;

    // 2. Link the request close event to the abort signal
    // This triggers if the user cancels the request or loses connection
    req.on('close', () => {
        controller.abort();
    });

    try {
        // 3. Pass the signal to the database query
        // Note: Check your DB driver documentation (mysql2/pg) to ensure it supports the signal option
        const [sqlresponse] = await db.query({
            sql,
            signal
        });

        console.log("Query successful");
        res.status(200).json({ sqlresponse });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Query was cancelled by the user.');
            // No need to send a response here as the connection is already closed
        } else {
            console.error("Query Error:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    } finally {
        console.log("Controller execution finished");
    }
};

export const getWhatsAppLeadsDetails = async (req, res) => {
    const oBaseResponse = new BaseResponse();

    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10; // Default limit 10 is better than 1
        const offset = (page - 1) * limit;
        const sortColumn = req.query.sort || "Lead_Owner"; // Default sort by ID
        const sortOrder = req.query.order || "ASC"; // Default A-Z

        const allowedColumns = ["Lead_Owner", "Status", "Text", "WA_ID"];
        const safeColumn = allowedColumns.includes(sortColumn) ? sortColumn : "ID";
        const safeOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

        // 1. Get the Search Term (defaults to empty string if not provided)
        const searchTerm = req.query.search || ""; 

        // 2. Build the SQL Query
        // We add "WHERE city.Name LIKE ?" to filter results
        // We use % wildcard so "Lon" finds "London"
        const sql = `
            select * from whatsapp_leads 
            WHERE Lead_Owner LIKE ? 
            ORDER BY ${safeColumn} ${safeOrder}  
            LIMIT ? OFFSET ?
        `;

        // 3. Prepare Parameters
        // The order matches the ? marks: Search Term -> Limit -> Offset
        const searchPattern = searchTerm ? `%${searchTerm}%` : '%%';
        
        console.log("Searching for:", searchPattern);

        const [rows] = await db.query(sql, [searchPattern, limit, offset]);

        // 4. Get Total Count (Must also be filtered!)
        // If searching for "New", we count only "New York", "New Delhi", etc., not ALL cities
        const countSql = `
            SELECT COUNT(*) as total 
            FROM whatsapp_leads 
            WHERE Lead_Owner LIKE ?
        `;
        const [countResult] = await db.query(countSql, [searchPattern]);
       

        oBaseResponse.success.message = "Success";
        oBaseResponse.success.status = true;
        oBaseResponse.success.data = {
            rows: rows,
            meta: {
                page: page,
                limit: limit,
                total: countResult.total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        };

        res.status(200).json(oBaseResponse);

    } catch (error) {
        console.error(error);
        oBaseResponse.error.message = error.message;
        oBaseResponse.error.status = true;
        oBaseResponse.error.code = 500;
        res.status(500).json(oBaseResponse);
    }
};