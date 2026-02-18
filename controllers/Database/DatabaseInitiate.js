import { DB_INIT } from '../../models/dbInit.js'

export const initiateDatabase = async (req, res) => {
    try {
        const response = await DB_INIT.initialize();
        res.status(200).json(response);
    } catch (error) {
        console.error("Error initializing database:", error);
        res.status(500).json({ message: "Failed to initialize database", error: error.message });
    }
};
