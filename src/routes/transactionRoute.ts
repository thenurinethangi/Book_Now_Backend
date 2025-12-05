import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getCinemaAllTransaction } from '../controllers/transactionController';

const router = express.Router();

router.get('/cinema/all', authenticate, authorize([Role.CINEMA]), getCinemaAllTransaction);

export default router;