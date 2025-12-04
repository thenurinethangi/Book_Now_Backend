import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getCinemaAllBookings } from '../controllers/bookingController';

const router = express.Router();

router.get('/cinema/all',authenticate,authorize([Role.CINEMA]),getCinemaAllBookings);

export default router;