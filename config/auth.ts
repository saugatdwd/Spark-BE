import type {Request, Response} from 'express';
/**
 * Auth middleware
 */

import jwt from "jsonwebtoken";
import User from '../models/user';
import { AuthRequest } from '../types/express/auth';


const auth = async (req: AuthRequest, res: Response, next: () => void) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || "";
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (typeof decoded === 'object' && decoded !== null) {
      const user = await User.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });
      if (!user) throw new Error();
      req.token = token;
      req.user = user;
    }
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

export default auth;
