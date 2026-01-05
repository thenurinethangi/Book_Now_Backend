import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getAllAdmins, getAllUsers, getCurrentUserAndCinemaData, getCurrentUserData, logout } from '../controllers/userController';

const router = express.Router();

router.get('/admin/all/users', authenticate, authorize([Role.ADMIN]), getAllUsers);

router.get('/admin/all/admins', authenticate, authorize([Role.ADMIN]), getAllAdmins);

router.get('/current', authenticate, authorize([Role.USER,Role.CINEMA,Role.ADMIN]), getCurrentUserData);

router.get('/logout', authenticate, authorize([Role.USER,Role.CINEMA,Role.ADMIN]), logout);

router.get('/current/cinema', authenticate, authorize([Role.CINEMA]), getCurrentUserAndCinemaData);

export default router;