import {db,db_local} from '../config/db.js'
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
dotenv.config()
import jwt from 'jsonwebtoken';
import { Users } from '../models/Users.js';
import { LOCAL_DB_QUERY } from '../config/Local_DB_Queries.js';


export const LoginController = async (req, res) => {
    
    try {
        const { username, password } = req.body;

        // 1. Query only for the specific user
        const [rows] = await db_local.query(LOCAL_DB_QUERY.GET_USER_BY_USERNAME, [username]);
        const user = rows[0];
  
        // 2. Check if user exists and validate password
        let isValidPassword = false;
        if (user) {
            // If the stored password looks like a bcrypt hash, use bcrypt.compare
            if (typeof user.password === 'string' && user.password.startsWith('$2')) {
                isValidPassword = await bcrypt.compare(password, user.password);
            } else {
                isValidPassword = password === user.password;
            }
        }
        if (!user || !isValidPassword) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET || 'your_secret_key', 
            { expiresIn: '1h' }
        );
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 3600000
        });
        return res.status(200).json({ message: "Login Successful", role: user.role,token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
;

export const List_Users = async (req,res,next)=>{
    const [usersList] = await db_local.query(LOCAL_DB_QUERY.GET_ALL_USERS);
    const oUsers = new Users(usersList)
    oUsers.message = "Success";
    oUsers.status = true;
    res.status(200).json(oUsers)
}