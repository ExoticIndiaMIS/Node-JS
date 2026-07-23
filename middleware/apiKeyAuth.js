import { userDb } from "../config/userDb.js";
import { logger } from "../utils/logger.js";

/**
 * Middleware to enforce API Key security against process.env.API_KEY and userDb.
 */
export const verifyApiKey = (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const apiKey = req.headers['x-api-key'] || 
                   req.headers['api-key'] || 
                   (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ') ? req.headers['authorization'].split(' ')[1] : null) ||
                   req.query.api_key;

    if (!apiKey) {
        logger.warn(`Unauthorized API call attempt blocked`, {
            ip: clientIp,
            path: req.originalUrl || req.url,
            method: req.method,
            providedKey: '[NO_KEY_PROVIDED]'
        });

        return res.status(401).json({
            status: false,
            error: "Unauthorized: Missing API key. Please pass 'x-api-key' header or Bearer token."
        });
    }

    // Check if key matches process.env.API_KEY OR user in userDb
    const envMasterKey = process.env.API_KEY;
    const isMasterMatch = envMasterKey && apiKey === envMasterKey;
    const user = userDb.findUserByApiKey(apiKey);

    if (!isMasterMatch && !user) {
        logger.warn(`Unauthorized API call attempt blocked`, {
            ip: clientIp,
            path: req.originalUrl || req.url,
            method: req.method,
            providedKey: '[INVALID_KEY]'
        });

        return res.status(401).json({
            status: false,
            error: "Unauthorized: Invalid API key. Access denied."
        });
    }

    req.user = user || { username: 'admin', role: 'admin', apiKey };
    next();
};


