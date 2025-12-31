import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { cancelBooking, getAllMyBookings, getCinemaAllBookings, getCinemaTodayBooking } from '../controllers/bookingController';

const router = express.Router();

router.get('/cinema/all', authenticate, authorize([Role.CINEMA]), getCinemaAllBookings);

router.get('/cinema/today/stats', authenticate, authorize([Role.CINEMA]), getCinemaTodayBooking);

router.get('/mybookings', authenticate, authorize([Role.USER]), getAllMyBookings);

router.put('/cancel/:id', authenticate, authorize([Role.USER]), cancelBooking);

export default router;