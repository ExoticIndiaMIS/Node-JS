import { db_local } from '../config/db.js'
import bcrypt from 'bcrypt'
import { LOCAL_DB_QUERY } from '../config/Local_DB_Queries.js'
import {User} from '../models/Users.js'

const hasEmailColumn = async () => {
  try {
    const [rows, fields] = await db_local.query(LOCAL_DB_QUERY.GET_FIRST_USER)
    if (Array.isArray(fields)) {
      return fields.some(f => f.name === 'email')
    }
    return rows.length > 0 && Object.prototype.hasOwnProperty.call(rows[0], 'email')
  } catch {
    return false
  }
}

export const RegisterController = async (req, res) => {
  try {
    const { username, email, password, confirm ,role_id} = req.body
    if (!username || !password||!role_id) {
      return res.status(400).json({ message: 'Missing fields' })
    }
    if (confirm && confirm !== password) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }
    const [exists] = await db_local.query(LOCAL_DB_QUERY.GET_USER_BY_USERNAME, [username])
    if (exists.length > 0) {
      return res.status(409).json({ message: 'Username already exists' })
    }
   
    const hash = await bcrypt.hash(password, 10)
    const emailSupported = await hasEmailColumn()
    if (emailSupported) {
      const [result] = await db_local.query(LOCAL_DB_QUERY.REGISTER_USER_WITH_EMAIL, [username, email , hash,role_id])
      return res.status(201).json({ id: result.insertId, message: 'Registered successfully' })
    } else {
      const [result] = await db_local.query(LOCAL_DB_QUERY.REGISTER_USER_WITHOUT_EMAIL, [username, hash, role_id])
      return res.status(201).json({ id: result.insertId, message: 'Registered successfully' })
    }
  } catch (e) {
    return res.status(500).json({ message: 'Registration failed',Error:e })
  }
}

export const GetUserDetails = async (req, res,next) => {
  // Implementation for getting user details
  try {
  const userId = req.params.id;
  const [user] = await db_local.query(LOCAL_DB_QUERY.GET_USER_BY_ID, [userId]);
  if (user.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }
  const userResponse  = new User(user[0]);
  return res.status(200).json(userResponse);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get user details', Error: error });
  }
}

export const UpdateUserDetails = async (req, res,next) => {
  // Implementation for updating user details
  const userId = req.params.id;
  const { username, email, password, role_id } = req.body
  try {
     const hash = await bcrypt.hash(password, 10)
    const [result] = await db_local.query(LOCAL_DB_QUERY.UPDATE_USER_DETAILS, [username, email,hash, role_id, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user', Error: error });
  }
}

export const DeleteUser = async (req, res,next) => {
  // Implementation for deleting a user
  const userId = req.params.id;
  try {
    const [result] = await db_local.query(LOCAL_DB_QUERY.DELETE_USER_BY_ID, [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user', Error: error });
  }
}


