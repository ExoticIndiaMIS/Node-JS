import { db } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Controller to execute general-purpose SQL queries using promise pool,
 * with automatic local DB fallback on ETIMEDOUT, execution duration, row/column metrics, and request logging.
 */
export const runQuery = async (req, res) => {
    const startTime = Date.now();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string' || !sql.trim()) {
        const durationMs = Date.now() - startTime;
        logger.warn(`[API CALL] Invalid SQL query payload received`, { ip: clientIp, durationMs: `${durationMs}ms` });
        return res.status(400).json({ status: false, error: "SQL query string is required in request body as { 'sql': 'SELECT ...' }" });
    }

    logger.info(`[API CALL] /runQuery initiated`, { ip: clientIp, queryPreview: sql.slice(0, 200) });

    try {
        let sqlresponse;
        try {
            // Attempt primary remote DB connection
            [sqlresponse] = await db.query(sql);
        } catch (primaryErr) {
            // If primary DB times out (ETIMEDOUT) or refuses connection, attempt local DB fallback
            if (primaryErr.code === 'ETIMEDOUT' || primaryErr.code === 'ECONNREFUSED') {
                logger.warn(`Primary DB (${process.env.DB_HOST}) failed (${primaryErr.code}). Trying local DB fallback...`);
                try {
                    [sqlresponse] = await db_local.query(sql);
                } catch (localErr) {
                    throw primaryErr; // throw original primary error if local fallback also fails
                }
            } else {
                throw primaryErr;
            }
        }

        const durationMs = Date.now() - startTime;
        const totalRows = Array.isArray(sqlresponse) ? sqlresponse.length : 0;
        const totalColumns = (totalRows > 0 && typeof sqlresponse[0] === 'object' && sqlresponse[0] !== null) 
            ? Object.keys(sqlresponse[0]).length 
            : 0;

        const jsonString = JSON.stringify(sqlresponse);
        const totalBytes = Buffer.byteLength(jsonString, 'utf8');

        logger.info(`[API CALL] /runQuery completed successfully`, {
            ip: clientIp,
            executionTime: `${durationMs}ms`,
            totalRows,
            totalColumns,
            totalBytes,
            query: sql.slice(0, 150)
        });

        return res.status(200).json({
            sqlresponse,
            meta: {
                executionTime: `${durationMs}ms`,
                totalRows,
                totalColumns,
                totalBytes
            }
        });

    } catch (error) {
        const durationMs = Date.now() - startTime;
        logger.error(`[API CALL] /runQuery Error`, {
            ip: clientIp,
            error: error.message,
            code: error.code,
            executionTime: `${durationMs}ms`,
            query: sql.slice(0, 150)
        });

        return res.status(500).json({
            status: false,
            error: `Database connection timed out (${error.code || 'ETIMEDOUT'}). MySQL server at '${process.env.DB_HOST}' is unresponsive or port 3306 is blocked.`,
            details: error.message,
            executionTime: `${durationMs}ms`
        });
    }
};



