import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.join(process.cwd(), 'users.json');

// Default initial users
const defaultUsers = [
    {
        id: 1,
        username: 'admin',
        apiKey: process.env.API_KEY || 'exotic-mis-secret-key-2026',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        username: 'user1',
        apiKey: 'user1-secret-key-2026',
        role: 'user',
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

function loadUsers() {
    if (!fs.existsSync(DB_FILE)) {
        saveUsers(defaultUsers);
        return defaultUsers;
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const users = JSON.parse(data);

        // Sync process.env.API_KEY to admin if defined in .env
        if (process.env.API_KEY) {
            const adminUser = users.find(u => u.username === 'admin');
            if (adminUser && adminUser.apiKey !== process.env.API_KEY) {
                adminUser.apiKey = process.env.API_KEY;
                saveUsers(users);
            }
        }

        return users;
    } catch (err) {
        return defaultUsers;
    }
}


function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export const userDb = {
    getAllUsers: () => {
        return loadUsers();
    },

    findUserByApiKey: (apiKey) => {
        if (!apiKey) return null;
        const users = loadUsers();
        return users.find(u => u.apiKey === apiKey && u.isActive) || null;
    },

    findUserByUsername: (username) => {
        const users = loadUsers();
        return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    },

    createUser: ({ username, role = 'user', customApiKey = null }) => {
        const users = loadUsers();
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            throw new Error(`Username '${username}' already exists.`);
        }

        const generatedKey = customApiKey || `key_${crypto.randomBytes(12).toString('hex')}`;
        const newUser = {
            id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username: username.trim(),
            apiKey: generatedKey,
            role,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);
        return newUser;
    },

    deleteUser: (username) => {
        let users = loadUsers();
        const initialCount = users.length;
        users = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
        if (users.length === initialCount) {
            throw new Error(`User '${username}' not found.`);
        }
        saveUsers(users);
        return true;
    }
};
