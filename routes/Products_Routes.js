import express from "express";
import {getProductsDetails,getWhatsAppLeadsDetails} from "../controllers/ProductsControllers.js"
import {Products_Response} from "../controllers/Products/Products.js"
import {Product_Stock_Prices_Response} from "../controllers/Products/Product_Stock_Prices.js"
import {Products_Fields_Books_Response} from "../controllers/Products/Products_Fields_Books.js"
import {Products_Fields_Products_Response} from "../controllers/Products/Products_Fields_Products.js"
const productRouter = express.Router()
productRouter.get("/productsDetails",(req,res,next)=>{
       /* #swagger.tags = ['Products'] */
    getProductsDetails(req,res,next)
})

productRouter.get("/whatsappleads",(req,res,next)=>{
       /* #swagger.tags = ['Products'] */
    getWhatsAppLeadsDetails(req,res,next)
})
productRouter.post("/products",(req,res,next)=>{
   /* #swagger.tags = ['Products']
       #swagger.description = 'Enter Any Query in Request body it will provide json response'
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'GET PRODUCT',
            schema: {
                $itemcode: ''
            }
        } 
    */
    Products_Response(req,res,next)
})
// Product Stock Pricess 

productRouter.post("/product_stock_prices",(req,res,next)=>{
    /* #swagger.tags = ['Product_Stock_Prices']
       #swagger.description = 'Enter Any Query in Request body it will provide json response'
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'GET Product_Stock_Prices',
            schema: {
                $itemcode: ''
            }
        } 
    */
    Product_Stock_Prices_Response(req, res, next);
})

productRouter.post("/product_fields_books",(req,res,next)=>{
    /* #swagger.tags = ['Products_Fields_Books']
       #swagger.description = 'Enter Any Query in Request body it will provide json response'
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'GET Products_Fields_Books',
            schema: {
                $itemcode: ''
            }
        } 
    */
   Products_Fields_Books_Response(req, res, next);
})

productRouter.post("/product_fields_products",(req,res,next)=>{
    /* #swagger.tags = ['Products_Fields_Products']
       #swagger.description = 'Enter Any Query in Request body it will provide json response'
       #swagger.parameters['obj'] = {
            in: 'body',
            description: 'GET Products_Fields_Products',
            schema: {
                $itemcode: ''
            }
        } 
    */
   Products_Fields_Products_Response(req, res, next);
})

export default productRouter