import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { confirmTransactionAndBookingIfBookingComplete, deleteTransactionAndBookingIfErrorInBooking, getCinemaAllTransaction, getCinemaRevenue, getCinemaThisWeekRevenue, getCinemaTodayRevenue, getCinemaWholeYearRevenue, getCompleteTransactionCount, getFailedTransactionCount, getPendingTransactionCount, getShowtimeDetailsByPaymentId } from '../controllers/transactionController';

const router = express.Router();

router.post('/cinema/all', authenticate, authorize([Role.CINEMA]), getCinemaAllTransaction);

router.get('/cinema/today/revenue', authenticate, authorize([Role.CINEMA]), getCinemaTodayRevenue);

router.get('/cinema/year/revenue', authenticate, authorize([Role.CINEMA]), getCinemaWholeYearRevenue);

router.get('/cinema/week/revenue', authenticate, authorize([Role.CINEMA]), getCinemaThisWeekRevenue);

router.get('/details/:transactionId', authenticate, authorize([Role.USER]), getShowtimeDetailsByPaymentId);

router.put('/failed/:transactionId', authenticate, authorize([Role.USER]), deleteTransactionAndBookingIfErrorInBooking);

router.put('/success/:transactionId', authenticate, authorize([Role.USER]), confirmTransactionAndBookingIfBookingComplete);

router.get('/cinema/revenue', authenticate, authorize([Role.CINEMA]), getCinemaRevenue);

router.get('/cinema/all/complete/count', authenticate, authorize([Role.CINEMA]), getCompleteTransactionCount);

router.get('/cinema/all/pending/count', authenticate, authorize([Role.CINEMA]), getPendingTransactionCount);

router.get('/cinema/all/fail/count', authenticate, authorize([Role.CINEMA]), getFailedTransactionCount);

export default router;