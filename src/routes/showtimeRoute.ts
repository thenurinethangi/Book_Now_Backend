import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { addANewShowtime, checkShowtimeAlreadyExist, getAllShowtimesOfACinema, getAllShowtimesOfAMovie, getCinemaShowtime, getShowtimeDetailsById, getUnavailableSeats } from '../controllers/showtimeController';

const router = express.Router();

router.get('/cinema/all',authenticate,authorize([Role.CINEMA]),getCinemaShowtime);

router.post('/cinema/check/availability',authenticate,authorize([Role.CINEMA]),checkShowtimeAlreadyExist);

router.post('/cinema/add',authenticate,authorize([Role.CINEMA]),addANewShowtime);

router.get('/7Days/:movieId',getAllShowtimesOfAMovie);

router.get('/:id',getShowtimeDetailsById);

router.get('/bookings/:id',getUnavailableSeats);

router.get('/cinema/7Days/:cinemaId',getAllShowtimesOfACinema);

export default router;