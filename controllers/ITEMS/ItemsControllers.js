import { db_local, db } from '../../config/db.js';
import { LOCAL_DB_QUERY } from '../../config/Local_DB_Queries.js';
import XLSX from 'xlsx';
import axios from 'axios';
import fs from 'fs';
import HttpAgent, { HttpsAgent } from 'agentkeepalive';
import pLimit from 'p-limit';
import { PRODUCTS_QUERIES } from '../../config/Products/Products.js';
import archiver from 'archiver';
import { logger } from '../../utils/logger.js';





// Create a global controller to stop the sync if needed
let syncAbortController = new AbortController();

export const StopSync = () => {
    syncAbortController.abort();
    syncAbortController = new AbortController(); // Reset for next time
    console.log("Sync stop signal sent.");
};
// Create a persistent agent
const keepAliveAgent = new HttpsAgent({
    maxSockets: 100,      // Max simultaneous connections
    maxFreeSockets: 10,
    timeout: 60000,       // Keep unused connections open for 60s
    freeSocketTimeout: 30000, 
});

// Create an axios instance using this agent
const apiClient = axios.create({
    httpsAgent: keepAliveAgent,
    timeout: 5000
});


export const runLocalQuery =async  (req,res)=>{
    
    const {sql} = req.body
    const [sqlresponse] = await db_local.query(sql);
    console.log(sqlresponse)
    res.status(200).json({sqlresponse})
    console.log("Controlers used")
}

export const GetItemByCodes = async (req, res) => {
    try {
        const { itemCodes } = req.body;
        if (!itemCodes || !Array.isArray(itemCodes) || itemCodes.length === 0) {
            return res.status(400).json({ message: "Please provide a non-empty array of itemCodes" });
        }
        const [rows] = await db_local.query(LOCAL_DB_QUERY.GET_ITEMS_BY_ITEMCODES, [itemCodes]);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching items", error });
    }
};


export const GetAllItems = async (req, res) => {
    try {
        const [rows] = await db_local.query(LOCAL_DB_QUERY.GET_ALL_ITEMS);
        res.status(200).json(rows);
    } catch (error) {   
        console.error(error);
        res.status(500).json({ message: "Error fetching items", error });
    }
    
};



export const InsertBulkItems = async (req, res) => {
    try {
        // Assume req.body.items is an array of objects
        // We need to convert it to a nested array: [[code, name, price, qty, url], ...]
        const itemsData = req.body.items.map(item => [
            item.itemCode,
            item.itemName,
            item.price,
            item.quantity,
            item.imageUrls
        ]);

        if (itemsData.length === 0) {
            return res.status(400).json({ message: "No items to insert" });
        }

        // Notice the [itemsData] wrapper. 
        // The query expects 'VALUES ?', so we pass [ [ [row1], [row2] ] ]
        const [result] = await db_local.query(LOCAL_DB_QUERY.INSERT_BULK_ITEMS, [itemsData]);

        res.status(201).json({ 
            message: "Items inserted successfully", 
            insertedCount: result.affectedRows 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Bulk insert failed", error });
    }
};

export const GenerateImageLinks = async (req, res) => {
    try {
        const { start = 0, end = 35680, filePath = 'Input.xlsx', itemCode } = req.body;

        let codes = [];

        if (itemCode) {
            const inputCodes = Array.isArray(itemCode) ? itemCode : [itemCode];
            codes = inputCodes.map(c => String(c).replace(/\s/g, '').toLowerCase()).filter(c => c.length > 0);
        } else {
            // 1. Read Excel File
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: `File ${filePath} not found` });
            }
            const workbook = XLSX.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // header: 1 returns an array of arrays
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Extract codes from Column 0 and Column 2, remove spaces, convert to lowercase
            codes = data.slice(1).map(row => {
                const part1 = row[0] ? String(row[0]) : '';
                const part2 = row[2] ? String(row[2]) : '';
                return (part1 + part2).replace(/\s/g, '').toLowerCase();
            }).filter(c => c.length > 0);
        }
        
        console.log(`Total Codes Extracted: ${codes.length}`);
        
        // Slice codes based on Start/End inputs BEFORE querying to save resources
        const safeEnd = Math.min(end, codes.length);
        const codesToProcess = codes.slice(start, safeEnd);

        if (codesToProcess.length === 0) {
            return res.status(400).json({ message: "No codes found to process in the given range" });
        }
        console.log(`Processing ${codesToProcess.length} codes (Index ${start} to ${safeEnd})...`);

        // 2. Query Database (Using remote db as per script logic)
        const query = `
            SELECT DISTINCT 
                CONCAT(
                    LOWER(REPLACE(psp.itemcode, ' ', '')),
                    CASE WHEN psp.size IS NOT NULL AND psp.size != '' THEN CONCAT('-', LOWER(REPLACE(psp.size, ' ', ''))) ELSE '' END,
                    CASE WHEN psp.color IS NOT NULL AND psp.color != '' THEN CONCAT('-', LOWER(REPLACE(psp.color, ' ', ''))) ELSE '' END
                ) AS Code,
                p.title AS ItemName,
                psp.price AS Price,
                psp.local_stock AS Stock,
                CONCAT("https://cdn.exoticindia.com/images/products/original/",
                    REPLACE(REPLACE(LOWER(p.image), ".webp", ""), ".jpg", ""),
                    CASE
                        WHEN psp.color = "" OR psp.color IS NULL THEN ""
                        ELSE CONCAT("-", REPLACE(LOWER(psp.color), " ", ""))
                    END,
                    ".jpg") AS ImageURL
            FROM products p
            LEFT JOIN products_stock_prices psp ON psp.itemcode = p.itemcode
            WHERE CONCAT(REPLACE(LOWER(psp.itemcode), ' ', ''), LOWER(REPLACE(psp.color, ' ', ''))) IN (?)
        `;

        // Chunk the query to avoid packet size limits
        const DB_CHUNK_SIZE = 2000;
        let rows = [];
        for (let i = 0; i < codesToProcess.length; i += DB_CHUNK_SIZE) {
            const chunk = codesToProcess.slice(i, i + DB_CHUNK_SIZE);
            if (chunk.length > 0) {
                const [chunkRows] = await db.query(query, [chunk]);
                rows = rows.concat(chunkRows);
            }
        }
        
        const results = [];

        // 3. Check Image Variations with Concurrency
        const processRow = async (row) => {
            const baseUrl = row.ImageURL;
            const validUrls = [baseUrl];
            let consecutiveFailures = 0;
            const maxFailures = 2;

            for (let j = 1; j < 100; j++) {
                const suffix = `_a${j < 10 ? '0' + j : j}.jpg`;
                const newUrl = baseUrl.replace(".jpg", "") + suffix;

                try {
                    const response = await axios.head(newUrl, { timeout: 5000 });
                    if (response.headers['content-type'] && response.headers['content-type'].startsWith('image')) {
                        validUrls.push(newUrl);
                        consecutiveFailures = 0;
                    } else {
                        throw new Error('Not an image');
                    }
                } catch (e) {
                    consecutiveFailures++;
                    if (consecutiveFailures >= maxFailures) break;
                }
            }

            // Update Local DB
            const [existing] = await db_local.query(LOCAL_DB_QUERY.GET_ITEM_BY_ITEMCODE, [row.Code]);
            if (existing.length > 0) {
                await db_local.query(LOCAL_DB_QUERY.UPDATE_ITEM_IMAGES, [validUrls.join(', '), validUrls.length, row.Code]);
            } else {
                await db_local.query(LOCAL_DB_QUERY.INSERT_ITEM_WITH_IMAGES, [
                    row.Code,
                    row.ItemName || 'Unknown Item',
                    row.Price || 0,
                    row.Stock || 0,
                    validUrls.join(', '),
                    validUrls.length
                ]);
            }
            return { Itemcode: row.Code, URLS: validUrls.join(', '), ImgCount: validUrls.length };
        };

        // Process rows in parallel batches
        const CONCURRENCY = 20;
        for (let i = 0; i < rows.length; i += CONCURRENCY) {
            const batch = rows.slice(i, i + CONCURRENCY);
            const batchResults = await Promise.all(batch.map(r => processRow(r)));
            results.push(...batchResults);
        }

        // 4. Write CSV
        const csvFileName = `Images${start}-${end}.csv`;
        const csvContent = "Itemcode,URLS,ImgCount\n" + results.map(r => `${r.Itemcode},"${r.URLS}",${r.ImgCount}`).join('\n');
        fs.writeFileSync(csvFileName, csvContent);

        res.status(200).json({ message: "CSV Generated Successfully", fileName: csvFileName, totalProcessed: results.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating image links", error: error.message });
    }
};


export const SyncFromRemoteDB = async (req, res) => {
   
    try{
        // Get All the items in  local db
       
        const [getAllitems] = await db_local.query(LOCAL_DB_QUERY.GET_ALL_ITEMS);
        const allItemcodes = getAllitems.map(item => item.ITEMCODE);
        logger.log("Total Item in DB : ",allItemcodes)

        const [newRecords] = await db.query(PRODUCTS_QUERIES.GET_PRODUCT_IMAGES_SYNC,allItemcodes);
        console.log("New Records :",newRecords)
        
        res.status(200).json({message:"succes"})
    }
   catch(e){
    logger.error(e)
    res.status(500).json({ message: "Error generating zip", error: e.message });
   }
};

export const DownloadImagesZip = async (req, res) => {
    try {
        const { itemCodes } = req.body;

        if (!itemCodes || !Array.isArray(itemCodes) || itemCodes.length === 0) {
            return res.status(400).json({ message: "Please provide a non-empty array of itemCodes" });
        }
        console.log("Itemcodes ", itemCodes);

        const cleanedCodes = itemCodes.map(code => String(code).replace(/\-_.\s/g, '-').replace(/\s/g, '').trim().toLowerCase());

        const [rows] = await db_local.query(LOCAL_DB_QUERY.GET_ITEMS_BY_ITEMCODES, [cleanedCodes]);
        console.log("Response : ",rows);
        if (rows.length === 0) {
            return res.status(404).json({ message: "No items found for the provided codes" });
        }

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.attachment("Download_Images"+new Date().getTime() +".zip");
        archive.pipe(res);

        const limit = pLimit(10);
        const downloadPromises = [];

        for (const row of rows) {
            console.log("Row : ",row);
            if (!row.IMAGE_URLS) continue;
            const urls = row.IMAGE_URLS.split(',').map(u => u.trim());
            console.log(urls);
            urls.forEach((url, index) => {
                console.log(url);
                downloadPromises.push(limit(async () => {
                    try {
                        const response = await axios({
                            url,
                            method: 'GET',
                            responseType: 'stream',
                            httpsAgent: keepAliveAgent
                        });
                        const ext = url.split('.').pop().split(/[?#]/)[0] || 'jpg';
                        const filename = `${row.ITEMCODE}/${row.ITEMCODE}${index===0?'':"_" + index}.${ext}`;
                        console.log(`Downloading ${url} to ${filename}`);
                        archive.append(response.data, { name: filename });
                    } catch (err) {
                        console.error(`Failed to download ${url}:`, err.message);
                    }
                }));
            });
        }

        await Promise.all(downloadPromises);
        await archive.finalize();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({ message: "Error generating zip", error: error.message });
    }
};
