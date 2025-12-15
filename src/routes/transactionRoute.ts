import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { deleteTransactionAndBookingIfErrorInBooking, getCinemaAllTransaction, getCinemaThisWeekRevenue, getCinemaTodayRevenue, getCinemaWholeYearRevenue, getShowtimeDetailsByPaymentId } from '../controllers/transactionController';

const router = express.Router();

router.get('/cinema/all', authenticate, authorize([Role.CINEMA]), getCinemaAllTransaction);

router.get('/cinema/today/revenue', authenticate, authorize([Role.CINEMA]), getCinemaTodayRevenue);

router.get('/cinema/year/revenue', authenticate, authorize([Role.CINEMA]), getCinemaWholeYearRevenue);

router.get('/cinema/week/revenue', authenticate, authorize([Role.CINEMA]), getCinemaThisWeekRevenue);

router.get('/details/:transactionId', authenticate, authorize([Role.USER]), getShowtimeDetailsByPaymentId);

router.delete('/failed/:transactionId', authenticate, authorize([Role.USER]), deleteTransactionAndBookingIfErrorInBooking);

export default router;