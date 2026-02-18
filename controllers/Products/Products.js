import {PRODUCTS_QUERIES} from '../../config/Products/Products.js'
import {db} from '../../config/db.js';
import { BaseResponse } from '../../models/BaseModel.js';
import AppError, { AppWarning } from '../../models/Error.js';
import {Products} from '../../models/Products/Products.js'

export const Products_Response =async  (req,res,next)=>{
    const oBaseResponse = new BaseResponse()
    try{
        const {itemcode} = req.body
        if(itemcode){
            const [sqlresponse] = await db.query(PRODUCTS_QUERIES.GET_PRODUCTS, [`%${itemcode}%`]);
            oBaseResponse.success.status = true;
            oBaseResponse.success.message = "Success";
            oBaseResponse.success.data.Products = new Products(sqlresponse);
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