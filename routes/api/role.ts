const router = require('express').Router();
import auth from '../../config/auth';
import type {Request, Response} from 'express';
import UserRole from "../../models/userrole"

router.get('/roles', auth, async (req: Request, res: Response) => {
  try {
    const roles = await UserRole.find();
    res.status(200).json(roles);
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
});

router.post('/roles', auth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newRole = new UserRole({ name });
    const existingRole = await UserRole.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role name already exists' });
    }

    await newRole.save();
    return res.status(201).json({ message: 'Successfully created user role', newRole });
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.get('/roles/:id', auth, async (req:Request, res: Response) => {
  const { id } = req.id;
  const userRole = await UserRole.findById(id);
  return !userRole ? res.sendStatus(404) : res.send(userRole);
});

export { router as roleRoutes }; 
