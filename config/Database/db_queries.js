export const DB_QUERIES = {
    // CREATE DB and TABLES

    CREATE_DB:`CREATE DATABASE IF NOT EXISTS ${process.env.LC_NAME}`,

    // ROLE TABLE
    CREATE_ROLE_TABLE:`CREATE TABLE IF NOT EXISTS roles (
                        id INT NOT NULL AUTO_INCREMENT,
                        name VARCHAR(100) NOT NULL,
                        PRIMARY KEY (id),
                        UNIQUE KEY roles_unique_name (name)
                        ) ENGINE=InnoDB;`,
    CREATE_ITEM_TABLE:`CREATE TABLE IF NOT EXISTS ITEM_TABLE (
                        ITEMCODE VARCHAR(100) NOT NULL,
                        ITEMNAME VARCHAR(255) NOT NULL,
                        PRICE DECIMAL(10, 2) NOT NULL,
                        QUANTITY INT NOT NULL,
                        IMAGE_QTY INT DEFAULT 0,
                        PRIMARY KEY (ITEMCODE),
                        IMAGE_URLS TEXT
                        ) ENGINE=InnoDB;`,
    // USER TABLE                        
    CREATE_USER_TABLE:`CREATE TABLE IF NOT EXISTS users (
                        id INT NOT NULL AUTO_INCREMENT,
                        username VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        role_id INT DEFAULT NULL, -- This is our reference column
                        PRIMARY KEY (id),
                        UNIQUE KEY email_unique (email),
                        -- Define the Foreign Key right in the CREATE statement
                        CONSTRAINT FK_user_role 
                            FOREIGN KEY (role_id) 
                            REFERENCES roles(id)
                            ON DELETE SET NULL -- If a role is deleted, user becomes 'role-less' instead of being deleted
                        ) ENGINE=InnoDB;`,
    CREATE_LEADS_TABLE:`CREATE TABLE IF NOT EXISTS whatsapp_leads (
                        Date DATE NOT NULL,
                        Time TIME NOT NULL,
                        Text TEXT,
                        Data TEXT,
                        Operator_Name VARCHAR(100),
                        WA_ID VARCHAR(50),
                        Sender_Name VARCHAR(100),
                        Itemcode VARCHAR(50),
                        Groupname VARCHAR(100),
                        Price DECIMAL(10,2),
                        Image VARCHAR(255),
                        Order_ID VARCHAR(50),
                        Amt VARCHAR(50),
                        Discount VARCHAR(50),
                        Lacquer VARCHAR(50),
                        Status VARCHAR(50),
                        Lead_Owner VARCHAR(100),
                        PRIMARY KEY (Date,Time, WA_ID)
                    );
`,
    // SEED DATA
    INSERT_ADMIN_ROLE: `INSERT IGNORE INTO roles (name) VALUES ('admin')`,
    INSERT_ADMIN_USER: `INSERT INTO users (username, email, password, role_id) 
                        SELECT 'admin', 'admin', ?, (SELECT id FROM roles WHERE name = 'admin') 
                        FROM DUAL 
                        WHERE NOT EXISTS (SELECT * FROM users WHERE username = 'admin')`
};