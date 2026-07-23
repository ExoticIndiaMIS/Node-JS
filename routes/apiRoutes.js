import express from "express";
import { runQuery } from "../controllers/ProductsControllers.js";
import { verifyApiKey } from "../middleware/apiKeyAuth.js";
import { userDb } from "../config/userDb.js";

const apiRouter = express.Router();

apiRouter.post("/runQuery", verifyApiKey, (req, res, next) => {
    /* #swagger.tags = ['General Purpose']
       #swagger.description = 'Enter Any Query in Request body it will provide json response'
       #swagger.security = [{ "apiKeyAuth": [] }]
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'SQL QUERY',
            schema: {
                $sql: 'select * from products limit 1 '
            }
        } 
    */
    runQuery(req, res, next);
});

// User Management Routes
apiRouter.get("/users", verifyApiKey, (req, res) => {
    /* #swagger.tags = ['User Management']
       #swagger.description = 'List all authorized API users and their API keys'
       #swagger.security = [{ "apiKeyAuth": [] }]
    */
    const users = userDb.getAllUsers();
    res.status(200).json({ status: true, users });
});

apiRouter.post("/users", verifyApiKey, (req, res) => {
    /* #swagger.tags = ['User Management']
       #swagger.description = 'Create a new user and generate an API key for them'
       #swagger.security = [{ "apiKeyAuth": [] }]
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'User details',
            schema: {
                $username: 'john',
                role: 'user',
                customApiKey: 'optional-custom-key'
            }
        }
    */
    const { username, role, customApiKey } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ status: false, error: "Username is required." });
    }

    try {
        const newUser = userDb.createUser({ username, role, customApiKey });
        res.status(201).json({
            status: true,
            message: "User created successfully",
            user: newUser
        });
    } catch (err) {
        res.status(400).json({ status: false, error: err.message });
    }
});

apiRouter.delete("/users/:username", verifyApiKey, (req, res) => {
    /* #swagger.tags = ['User Management']
       #swagger.description = 'Delete a user by username'
       #swagger.security = [{ "apiKeyAuth": [] }]
    */
    const { username } = req.params;
    try {
        userDb.deleteUser(username);
        res.status(200).json({ status: true, message: `User '${username}' deleted successfully.` });
    } catch (err) {
        res.status(404).json({ status: false, error: err.message });
    }
});

export default apiRouter;



