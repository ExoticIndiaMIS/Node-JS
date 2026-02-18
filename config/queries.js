export const QUERIES = {
    // User Management
    GET_ALL_USERS: `SELECT * FROM users`,
    GET_USER_BY_ID: `SELECT * FROM users WHERE id = ?`,
    GET_USER_BY_EMAIL: `SELECT * FROM users WHERE email = ?`,
    CREATE_USER: `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    
    // Task Management (Example based on your Swagger info)
    GET_ALL_TASKS: `SELECT * FROM tasks`,
    GET_TASK_BY_ID: `SELECT * FROM tasks WHERE id = ?`,
    ADD_TASK: `INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)`,
    UPDATE_TASK_STATUS: `UPDATE tasks SET status = ? WHERE id = ?`,
    DELETE_TASK: `DELETE FROM tasks WHERE id = ?`
};