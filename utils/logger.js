import winston from 'winston';


const customTimestamp = () => {
            return new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            }).replace(/,/g, ''); // Removes the comma between date and time
            };
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: customTimestamp }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: customTimestamp }),
    winston.format.json()
);

export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({ format: consoleFormat }),
        new winston.transports.File({ filename: 'sync.log', format: fileFormat }),
        new winston.transports.File({ filename: 'api_calls.log', format: fileFormat })
    ]
});