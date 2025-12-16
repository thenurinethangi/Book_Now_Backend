import express from 'express'
import { checkIsLock, checkLockedSeats, lockSeats } from '../controllers/seatsController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';

const router = express.Router();

router.post('/lock',authenticate,authorize([Role.USER]),lockSeats);

router.post('/check/islock',authenticate,authorize([Role.USER]),checkIsLock);

router.get('/check/all/islock/:showtimeId',authenticate,authorize([Role.USER]),checkLockedSeats);

export default router;
