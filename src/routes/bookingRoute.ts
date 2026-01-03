import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { cancelBooking, getAllMyBookings, getCanceledBookingsCount, getCinemaAllBookings, getCinemaTodayBooking, getScheduledBookingsCount, getTodayBookingsCount, getTotalBookingsCount } from '../controllers/bookingController';

const router = express.Router();

router.post('/cinema/all', authenticate, authorize([Role.CINEMA]), getCinemaAllBookings);

router.get('/cinema/today/stats', authenticate, authorize([Role.CINEMA]), getCinemaTodayBooking);

router.get('/mybookings', authenticate, authorize([Role.USER]), getAllMyBookings);

router.put('/cancel/:id', authenticate, authorize([Role.USER]), cancelBooking);

router.get('/cinema/all/count',authenticate,authorize([Role.CINEMA]),getTotalBookingsCount);

router.get('/cinema/today/count',authenticate,authorize([Role.CINEMA]),getTodayBookingsCount);

router.get('/cinema/scheduled/count',authenticate,authorize([Role.CINEMA]),getScheduledBookingsCount);

router.get('/cinema/canceled/count',authenticate,authorize([Role.CINEMA]),getCanceledBookingsCount);

export default router;