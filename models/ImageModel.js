import {db,db_local} from '../config/db.js'

class ImageModel {
   static async fetchImageUrls(formattedItems) {
    const query = `
        SELECT DISTINCT CONCAT(replace(lower(p.itemcode), "", "")) AS Code,
        CONCAT("https://cdn.exoticindia.com/images/products/original/",
        replace(REPLACE((p.image), ".webp", ""), ".jpg", ""),
        ".jpg") AS "ImageURl"
        FROM products p
        WHERE p.image is not null
        AND CONCAT(replace(lower(p.itemcode), " ", "")) IN ${formattedItems};
    `; // 👈 Fixed: Added the $ symbol before the curly braces
    
    const [rows] = await db.execute(query);
    return rows;
}

    static formatCodesForSql(codes) {
        return `('${codes.join("','")}')`;
    }
}

export default ImageModel;