import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getAllAdmins, getAllUsers } from '../controllers/userController';

const router = express.Router();

router.get('/admin/all/users',authenticate,authorize([Role.ADMIN]),getAllUsers);

router.get('/admin/all/admins',authenticate,authorize([Role.ADMIN]),getAllAdmins);

export default router;