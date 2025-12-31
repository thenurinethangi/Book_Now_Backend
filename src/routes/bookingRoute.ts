import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getAllMyBookings, getCinemaAllBookings, getCinemaTodayBooking } from '../controllers/bookingController';

const router = express.Router();

router.get('/cinema/all',authenticate,authorize([Role.CINEMA]),getCinemaAllBookings);

router.get('/cinema/today/stats',authenticate,authorize([Role.CINEMA]),getCinemaTodayBooking);

router.get('/mybookings',authenticate,authorize([Role.USER]),getAllMyBookings);

export default router;