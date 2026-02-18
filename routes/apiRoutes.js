import express from "express";
import { getProductsDetails,runQuery,getWhatsAppLeadsDetails} from "../controllers/ProductsControllers.js";
import multer from 'multer';
import ImageController from '../controllers/ImageController.js';
import {LoginController,List_Users} from "../controllers/LoginController.js"
import rateLimit from "../middleware/rateLimit.js"
import { verifyToken, authorizeRole } from "../middleware/auth.js"

import { initiateDatabase } from "../controllers/Database/DatabaseInitiate.js"
import {Products_Response} from "../controllers/Products/Products.js"
import {Product_Stock_Prices_Response} from "../controllers/Products/Product_Stock_Prices.js"
import {GetUserDetails,UpdateUserDetails,RegisterController,DeleteUser} from "../controllers/UsersControllers.js"
import productRouter from "./Products_Routes.js";
import { GetRoleDetails,UpdateRoleDetails,CreateRoleController,DeleteRole,ListRoles } from "../controllers/RoleControllers.js";
import { InsertBulkItems, GenerateImageLinks,GetAllItems,runLocalQuery, GetItemByCodes, SyncFromRemoteDB, DownloadImagesZip } from "../controllers/ITEMS/ItemsControllers.js";
// import ProductRouter from "./ProductsRoutes.js";
const apiRouter = express.Router()
const upload = multer({ dest: 'uploads/' });

apiRouter.use('/products',productRouter)

apiRouter.post("/runQuery",(req,res,next)=>{
    /* #swagger.tags = ['General Purpose']
       #swagger.description = 'Enter Any Query in Request body it will provide json response'
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'SQL QUERY',
            schema: {
                $sql: 'select * from products limit 1 '
            }
        } 
    */
    runQuery(req,res,next)
})

// Auth Routes 
apiRouter.post("/login",(req,res,next)=>{
    /* #swagger.tags = ['Auth']
        #swagger.parameters['body']={
        in:'body',
        "schema":{$username:'',$password:''}
        }
    */
    LoginController(req,res,next)
})
// User Management Routes
apiRouter.post("/register", (req,res,next)=>{
    /* #swagger.tags = ['Auth']
        #swagger.parameters['body']={
        in:'body',
        "schema":{$username:'',$email:'',$password:'',$confirm:'',$role_id:''}
        }
    */
    RegisterController(req,res,next)
})
apiRouter.get("/User/:id", (req,res,next)=>{
    /* #swagger.tags = ['Auth'] */
    GetUserDetails(req,res,next)
})
apiRouter.patch("/User/:id", (req,res,next)=>{
    /* #swagger.tags = ['Auth'] */
    UpdateUserDetails(req,res,next)
})
apiRouter.delete("/User/:id", (req,res,next)=>{
    /* #swagger.tags = ['Auth'] */
    DeleteUser(req,res,next)
})
apiRouter.get("/listusers", (req,res,next)=>{
    /* #swagger.tags = ['Auth'] */
    List_Users(req,res,next)
})

// Role Management Routes will be here
apiRouter.post("/createRoles", (req, res, next) => {
    /* #swagger.tags = ['Role Management']
       #swagger.description = 'Create a new role'
       #swagger.parameters['body']={
        in:'body',
        "schema":{$name:'',$permissions:''}
        }
    */
    CreateRoleController(req, res, next);
});
apiRouter.get("/listRoles", (req, res, next) => {
    /* #swagger.tags = ['Role Management']
       #swagger.description = 'List all roles'
    */
    ListRoles(req, res, next);
}   );
apiRouter.get("/role/:id", (req, res, next) => {
    /* #swagger.tags = ['Role Management']
       #swagger.description = 'Get role details by ID'
    */
    GetRoleDetails(req, res, next);
});     
apiRouter.put("/role/:id", (req, res, next) => {
    /* #swagger.tags = ['Role Management']
       #swagger.description = 'Update role details by ID'   
         #swagger.parameters['body']={
        in:'body',
        "schema":{$name:'',$permissions:''}
        } 
    */
    UpdateRoleDetails(req, res, next);
});
apiRouter.delete("/role/:id", (req, res, next) => {
    /* #swagger.tags = ['Role Management']
       #swagger.description = 'Delete role by ID'
    */
    DeleteRole(req, res, next);
});
// Database Initialization Route
apiRouter.post("/init-db", (req,res,next)=>{
    /* #swagger.tags = ['Database'] */
    initiateDatabase(req,res,next)
})
// Item Management Routes

apiRouter.post("/runLocalQuery",(req,res,next)=>{
    /* #swagger.tags = ['Items']
       #swagger.description = 'Enter Any Query in Request body it will provide json response'
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'RUN LOCAL DB SQL QUERY',
            schema: {
                $sql: 'select * from item_table limit 1 '
            }
        } 
    */
    runLocalQuery(req,res,next)
})
apiRouter.get("/items", (req, res, next) => {
    /* #swagger.tags = ['Items'] */
    GetAllItems(req, res, next);
});

apiRouter.post("/items/get-by-codes", (req, res, next) => {
    /* #swagger.tags = ['Items']
       #swagger.description = 'Get items by an array of item codes'
         #swagger.parameters['body'] = {
            in: 'body',
            description: 'Array of item codes',
            schema: {
                itemCodes: ['CODE1', 'CODE2', 'CODE3']
            }
        }
    */
    GetItemByCodes(req, res, next);
});

apiRouter.post("/items/bulk", (req, res, next) => {
    /* #swagger.tags = ['Items']
       #swagger.description = 'Bulk insert items into ITEM_TABLE'
       #swagger.parameters['body'] = {
            in: 'body',
            description: 'Array of items to insert',
            schema: {
                items: [
                    { itemCode: "CODE1", itemName: "Item 1", price: 10.5, quantity: 100, imageUrls: "url1" }
                ]
            }
       }
    */
    InsertBulkItems(req, res, next);
});

apiRouter.post("/items/generate-images", (req, res, next) => {
    /* #swagger.tags = ['Items']
       #swagger.description = 'Generate Image Links CSV from Excel Input'
       #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                start: 0,
                end: 100,
                filePath: 'Input.xlsx'
            }
       }
    */
    GenerateImageLinks(req, res, next);
});

apiRouter.post("/items/sync-remote", (req, res, next) => {
    /* #swagger.tags = ['Items']
       #swagger.description = 'Sync items from remote DB to local DB (Batch processing for Cron Job)'
       #swagger.parameters['body'] = {
            in: 'body',
           
       }
    */
    SyncFromRemoteDB(req, res, next);
});

apiRouter.post('/download-images-zip', (req,res,next)=>{
    /* #swagger.tags = ['Items']
       #swagger.description = '
       #swagger.parameters['body'] = {
            in: 'body',
            description: 'Array of item codes',
            schema: {
                itemCodes: ['CODE1', 'CODE2', 'CODE3']
            }
        }
    */
    DownloadImagesZip(req,res,next);
});

export default apiRouter
