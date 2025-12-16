import express from 'express'
import { lockSeats } from '../controllers/seatsController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';

const router = express.Router();

router.post('/lock',authenticate,authorize([Role.USER]),lockSeats);

export default router;
