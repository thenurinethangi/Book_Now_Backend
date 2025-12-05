import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getAllActiveCinemas } from '../controllers/cinemaController';

const router = express.Router();

router.get('/active',authenticate,authorize([Role.ADMIN]),getAllActiveCinemas);

export default router;