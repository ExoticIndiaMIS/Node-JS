import { db_local } from '../config/db.js'
import bcrypt from 'bcrypt'
import { LOCAL_DB_QUERY } from '../config/Local_DB_Queries.js'
import {Role,Roles} from '../models/Role.js'


export const CreateRoleController = async (req, res) => {
  try {
      const { name, permissions } = req.body
      if (!name || !permissions) {
        return res.status(400).json({ message: 'Missing fields' })
      }
      const [exists] = await db_local.query(LOCAL_DB_QUERY.GET_ROLE_ID_BY_ROLE_NAME, [name])
      if (exists.length > 0) {
        return res.status(409).json({ message: 'Role already exists' })
      }else{
        const [result] = await db_local.query(LOCAL_DB_QUERY.CREATE_ROLE, [name, permissions])
        return res.status(201).json({ id: result.insertId, message: 'Role created successfully' })
      }
    } catch (e) {
      return res.status(500).json({ message: 'Role creation failed',Error:e })
  }
}



export const GetRoleDetails = async (req, res,next) => {
  // Implementation for getting role details
  try {
  const roleId = req.params.id;
  const [role] = await db_local.query(LOCAL_DB_QUERY.GET_ROLE_BY_ID, [roleId]);
  if (role.length === 0) {
    return res.status(404).json({ message: 'Role not found' });
  }
  const roleResponse  = new Role(role[0]);
  return res.status(200).json(roleResponse);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get user details', Error: error });
  }
}

export const ListRoles = async (req,res,next)=>{
    const [rolesList] = await db_local.query(LOCAL_DB_QUERY.GET_ALL_ROLES);
    const oRoles = new Roles(rolesList)
    res.status(200).json(oRoles)
}

export const UpdateRoleDetails = async (req, res,next) => {
  // Implementation for updating role details
  const roleId = req.params.id;
  const { name, permissions } = req.body
  try {
    const [result] = await db_local.query(LOCAL_DB_QUERY.UPDATE_ROLE, [name, permissions, roleId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    return res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update role', Error: error });
  }
}
 

export const DeleteRole = async (req, res,next) => {
  // Implementation for deleting a role
  const roleId = req.params.id;
  try {
    const [result] = await db_local.query(LOCAL_DB_QUERY.DELETE_ROLE_BY_ID, [roleId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete role', Error: error });
  }
}


