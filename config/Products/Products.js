export const PRODUCTS_QUERIES = {
    // User Management
    GET_PRODUCTS: `SELECT * FROM products where  itemcode LIKE ? `,
    GET_ALL_PRODUCTS_STOCKS_PRICES: `SELECT * FROM products_stock_prices where  itemcode LIKE ?     `,
    GET_ALL_PRODUCTS_FIELDS_BOOKS: `SELECT * FROM products_fields_book where itemcode like ?`,
    GET_ALL_PRODUCTS_FIELDS_PRODUCTS: `SELECT * FROM products_fields_product where itemcode like ?`,
    GET_PRODUCT_IMAGES_SYNC:`
                SELECT DISTINCT 
                    CONCAT(
                        LOWER(REPLACE(p.itemcode, ' ', '')),
                        CASE WHEN psp.size IS NOT NULL AND psp.size != '' THEN CONCAT('-', LOWER(REPLACE(psp.size, ' ', ''))) ELSE '' END,
                        CASE WHEN psp.color IS NOT NULL AND psp.color != '' THEN CONCAT('-', LOWER(REPLACE(psp.color, ' ', ''))) ELSE '' END
                    ) AS Code,
                     p.groupname as GroupName,
                    p.title AS ItemName,
                    psp.price AS Price,
                    psp.local_stock AS Stock,
                    CONCAT("https://cdn.exoticindia.com/images/products/original/",
                        REPLACE(REPLACE(LOWER(p.image), ".webp", ""), ".jpg", ""),
                        CASE
                            WHEN psp.color = "" OR psp.color IS NULL THEN ""
                            ELSE CONCAT("-", REPLACE(LOWER(psp.color), " ", ""))
                        END,
                        ".jpg") AS ImageURL
                FROM products p
                LEFT JOIN products_stock_prices psp ON psp.itemcode = p.itemcode
                where  p.image is not null and p.itemcode not in (?) and p.itemcode is not null limit 1
            `
};