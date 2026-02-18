import {PRODUCTS_QUERIES} from '../../config/Products/Products.js'
import {db} from '../../config/db.js';
import { BaseResponse } from '../../models/BaseModel.js';
import AppError, { AppWarning } from '../../models/Error.js';
import {Product_Stock_Prices} from '../../models/Products/Product_Stock_Prices.js'

export const Product_Stock_Prices_Response =async  (req,res,next)=>{
    const oBaseResponse = new BaseResponse()
    try{
        const {itemcode} = req.body
        if(itemcode){
            const [sqlresponse] = await db.query(PRODUCTS_QUERIES.GET_ALL_PRODUCTS_STOCKS_PRICES, [`%${itemcode}%`]);
            oBaseResponse.success.status = true;
            oBaseResponse.success.message = "Success";
            oBaseResponse.success.data.Product_Stock_Prices = new Product_Stock_Prices(sqlresponse);
            oBaseResponse.success.data.count = sqlresponse.length;
            res.status(200).json(oBaseResponse);
        }else{
            oBaseResponse.warning = AppWarning.missingInput();
            res.status(400).json(oBaseResponse)
        }
    }catch(e){
       
        oBaseResponse.error = AppError.badRequest();
        res.status(e.statusCode || 500).json(oBaseResponse);
    }
    
}