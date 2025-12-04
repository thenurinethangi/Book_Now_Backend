import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { addANewShowtime, checkShowtimeAlreadyExist, getCinemaShowtime } from '../controllers/showtimeController';

const router = express.Router();

router.get('/cinema/all',authenticate,authorize([Role.CINEMA]),getCinemaShowtime);

router.post('/cinema/check/availability',authenticate,authorize([Role.CINEMA]),checkShowtimeAlreadyExist);

router.post('/cinema/add',authenticate,authorize([Role.CINEMA]),addANewShowtime);

export default router;