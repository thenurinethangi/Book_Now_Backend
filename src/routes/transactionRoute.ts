import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getCinemaAllTransaction, getCinemaThisWeekRevenue, getCinemaTodayRevenue, getCinemaWholeYearRevenue } from '../controllers/transactionController';

const router = express.Router();

router.get('/cinema/all', authenticate, authorize([Role.CINEMA]), getCinemaAllTransaction);

router.get('/cinema/today/revenue', authenticate, authorize([Role.CINEMA]), getCinemaTodayRevenue);

router.get('/cinema/year/revenue', authenticate, authorize([Role.CINEMA]), getCinemaWholeYearRevenue);

router.get('/cinema/week/revenue', authenticate, authorize([Role.CINEMA]), getCinemaThisWeekRevenue);

export default router;