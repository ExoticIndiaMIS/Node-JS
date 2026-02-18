export const LOCAL_DB_QUERY = {
    // User Management
    GET_FIRST_USER: `SELECT * FROM users LIMIT 1`,
    GET_ALL_USERS: `SELECT * FROM users`,
    GET_USER_BY_USERNAME: `SELECT * FROM users WHERE username = ?`,
    GET_USER_BY_ID: `SELECT * FROM users WHERE id = ?`,
    GET_USER_BY_EMAIL: `SELECT * FROM users WHERE email = ?`,
    REGISTER_USER_WITH_EMAIL: `INSERT INTO users (username, email, password,role_id) VALUES (?, ?, ?, ?)`,
    REGISTER_USER_WITHOUT_EMAIL: `INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)`,
    UPDATE_USER_DETAILS: `UPDATE users SET username = ?, email = ?, password = ?, role_id = ? WHERE id = ?`,
    DELETE_USER_BY_ID: `DELETE FROM users WHERE id = ?`,
    
    // Create Roles 
    GET_ALL_ROLES: `SELECT * FROM roles`,
    GET_ROLE_BY_ID: `SELECT * FROM roles WHERE id = ?`,
    GET_ROLE_ID_BY_ROLE_NAME: `SELECT id FROM roles WHERE name = ?`,
    CREATE_ROLE: `INSERT INTO roles (name, permissions) VALUES (?, ?)`,
    UPDATE_ROLE: `UPDATE roles SET name = ?, permissions = ? WHERE id = ?`,
    DELETE_ROLE_BY_ID: `DELETE FROM roles WHERE id = ?`,

    // Insert Record in Database
    INSERT_RECORD: `INSERT INTO ITEM_TABLE (ITEMCODE, ITEMNAME, PRICE, QUANTITY, IMAGE_URLS) VALUES (?, ?, ?, ?, ?)`,
    INSERT_BULK_ITEMS: `INSERT INTO ITEM_TABLE (ITEMCODE, ITEMNAME, PRICE, QUANTITY, IMAGE_URLS) VALUES ?`,
    UPDATE_ITEM_IMAGES: `UPDATE ITEM_TABLE SET IMAGE_URLS = ?, IMAGE_QTY = ? WHERE ITEMCODE = ?`,
    INSERT_ITEM_WITH_IMAGES: `INSERT INTO ITEM_TABLE (ITEMCODE, ITEMNAME, PRICE, QUANTITY, IMAGE_URLS, IMAGE_QTY) VALUES (?, ?, ?, ?, ?, ?)`,
    // Fetch Records from Database
    GET_ALL_ITEMS: `SELECT * FROM ITEM_TABLE  `,
    GET_ITEM_BY_ITEMCODE: `SELECT * FROM ITEM_TABLE WHERE ITEMCODE = ?`,
    GET_ITEMS_BY_ITEMCODES: `SELECT * FROM ITEM_TABLE WHERE ITEMCODE IN (?)`
};