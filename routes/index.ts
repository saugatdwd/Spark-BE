import { authRoutes } from "./api/auth";
import { roleRoutes } from "./api/role";
import { userRoutes } from "./api/users";
import matchRoutes from './api/match';
import messageRoutes from './api/message';

const router = require('express').Router();

router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/', roleRoutes);
router.use('/api/match', matchRoutes);
router.use('/api/message', messageRoutes);

export default router;
