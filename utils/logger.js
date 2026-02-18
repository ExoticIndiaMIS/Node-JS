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
export const logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp({ format: customTimestamp }),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                return `[${timestamp}] ${level.toUpperCase()}: ${message} ${
                    Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`;
                }),
                winston.format.json() // Central systems love JSON for filtering
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'sync.log' })
            ]
})